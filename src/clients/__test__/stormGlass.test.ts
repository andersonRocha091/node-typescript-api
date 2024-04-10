import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HourFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it('Should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    // axios.get = jest.fn().mockResolvedValue({data: stormGlassWeather3HoursFixture});
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HourFixture);
  });

  it('Should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2024-04-09T20:00:00+00:00',
        }
      ]
    }
    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual([]);
  });

  it('Should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    mockedAxios.get.mockRejectedValue({message: 'Network Error'});
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Network Error');
  });

  it('Should get a StormGlassReponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit Reached']}
      }
    });
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit Reached"]} Code: 429'
    )
  });
})