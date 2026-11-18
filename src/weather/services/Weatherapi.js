import axios from "axios";

const BASE_URL = "https://open-weather13.p.rapidapi.com";

const toCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;
const mphToMetersPerSecond = (mph) => mph * 0.44704;

export const getWeather = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/city`, {
      params: {
        city,
        lang: "EN",
      },
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
        "x-rapidapi-host": import.meta.env.VITE_RAPID_API_HOST,
      },
    });

    const data = response.data;

    // open-weather13 returns imperial units by default (°F, mph). Normalize to metric.
    if (data?.main) {
      const { temp, feels_like, temp_min, temp_max } = data.main;
      data.main = {
        ...data.main,
        ...(typeof temp === "number" ? { temp: toCelsius(temp) } : {}),
        ...(typeof feels_like === "number"
          ? { feels_like: toCelsius(feels_like) }
          : {}),
        ...(typeof temp_min === "number"
          ? { temp_min: toCelsius(temp_min) }
          : {}),
        ...(typeof temp_max === "number"
          ? { temp_max: toCelsius(temp_max) }
          : {}),
      };
    }

    if (data?.wind && typeof data.wind.speed === "number") {
      data.wind = {
        ...data.wind,
        speed: mphToMetersPerSecond(data.wind.speed),
      };
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};