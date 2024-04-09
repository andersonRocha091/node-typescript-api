import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HourFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  it('Should return the normalized forecast from the StormGlass service', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const lat = -33.792726;
    const lng = 151.289824;
    // axios.get = jest.fn().mockResolvedValue({data: stormGlassWeather3HoursFixture});
    mockedAxios.get.mockResolvedValue({data: stormGlassWeather3HoursFixture});
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HourFixture);
  })
})