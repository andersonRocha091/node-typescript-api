import { InternalError } from '@src/util/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

export interface StormGlassPointSource {
  [key:string]: number
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;

}
export interface StormGlassForecastRespose {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass');

export class ClientRequestError extends InternalError{
  constructor(message: string){
    const internalMessage = 'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError{
  constructor(message: string){
    const internalMessage = 'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlass {
  readonly stormGlassApiParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeigth,windDirection,windSpeed'
  readonly stormGlasApiSource = 'noaa';
  constructor(protected request = new HTTPUtil.Request()){

  }
  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]>{
    try{
      const response = await this.request.get<StormGlassForecastRespose>(`
        ${stormGlassResourceConfig.get('apiUrl')}/weather/point?params=swellDirection,swellHeight,swellPeriod,waveDirection,waveHeigth,windDirection,windSpeed&source=noaa&end=1712281267&lat=58.7984&lng=17.8081,
      `,
      {
        headers:{
          // Authorization: '800a8374-f2e5-11ee-a7bb-0242ac130002-800a8464-f2e5-11ee-a7bb-0242ac130002'
          Authorization: `${stormGlassResourceConfig.get('apiToken')}`,
        }
      });
      return this.normalizeResponse(response.data);
    } catch(err){
      if(HTTPUtil.Request.isRequestError(err)){
        throw new StormGlassResponseError(`Error: ${JSON.stringify(err.response.data)} Code: ${err.response.status}`);
      }
      throw new ClientRequestError(err.message);
    }
  }

  private normalizeResponse(points: StormGlassForecastRespose): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlasApiSource],
      swellHeight: point.swellHeight[this.stormGlasApiSource],
      swellPeriod: point.swellPeriod[this.stormGlasApiSource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlasApiSource],
      waveHeight: point.waveHeight[this.stormGlasApiSource],
      windDirection: point.windDirection[this.stormGlasApiSource],
      windSpeed: point.windSpeed[this.stormGlasApiSource]
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlasApiSource] &&
      point.swellHeight?.[this.stormGlasApiSource]&&
      point.swellPeriod?.[this.stormGlasApiSource]&&
      point.waveDirection?.[this.stormGlasApiSource]&&
      point.waveHeight?.[this.stormGlasApiSource]&&
      point.windDirection?.[this.stormGlasApiSource]&&
      point.windSpeed?.[this.stormGlasApiSource]
      );
  }
}