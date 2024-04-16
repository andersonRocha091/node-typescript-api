import { StormGlass } from '@src/clients/stormGlass';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import { Beach, BeachPosition, Forecast } from '../forecast';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  it('Should return the forecast for a list of beaches', async () => {
    StormGlass.prototype.fetchPoints = jest.fn().mockResolvedValue(stormGlassNormalizedResponseFixture);
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id'
      }
    ];
    const expectedResponse = [
      {
        time: "2024-04-05T00:00:00+00:00",
        forecast: [{
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
        rating: 1,
        swellDirection:71.98,
        swellHeight:0.09,
        swellPeriod:4.46,
        time: "2024-04-05T00:00:00+00:00",
        waveDirection:109.38,
        waveHeight:1.06,
        windDirection:96.56,
        windSpeed:96.56
        }]},
      {
        time: "2024-04-05T01:00:00+00:00",
        forecast:[{
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
        rating: 1,
        swellDirection: 109.24,
        swellHeight: 0.13,
        swellPeriod:4.51,
        time: "2024-04-05T01:00:00+00:00",
        waveDirection:111.06,
        waveHeight:1.09,
        windDirection:96.14,
        windSpeed:96.56
        }]}
    ];

    const forecast = new Forecast(new StormGlass());
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });
});