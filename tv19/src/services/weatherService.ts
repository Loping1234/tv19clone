import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

// WeatherAPI.com response shape
interface WeatherApiResponse {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

// Normalized shape used in the app
export interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

export const getWeatherByCity = async (city: string): Promise<WeatherResponse> => {
  if (!API_KEY) {
    throw new Error("Missing VITE_WEATHER_API_KEY in .env");
  }

  try {
    const response = await axios.get<WeatherApiResponse>(BASE_URL, {
      params: {
        key: API_KEY,
        q: city,
      },
    });

    const { location, current } = response.data;

    // Map WeatherAPI.com response to our app's WeatherResponse shape
    return {
      name: location.name,
      main: {
        temp: current.temp_c,
        humidity: current.humidity,
      },
      weather: [
        {
          description: current.condition.text,
          icon: current.condition.icon,
        },
      ],
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("WeatherAPI key is invalid or not activated yet");
    }

    throw error;
  }
};
