import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "missing latitude or longitude" });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: "error getting api key" });
  }

  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: "Error fetching weather data", error: data });
    }

    const weather = {
      temperature: data.current?.temp,
      description: data.current?.weather?.[0]?.description,
      windSpeed: data.current?.wind_speed,
      feelsLike: data.current?.feels_like,
      humidity: data.current?.humidity,
      visibility: data.current?.visibility,
      pressure: data.current?.pressure,
      uvIndex: data.current?.uvi,
      sunrise: data.current?.sunrise,
      sunset: data.current?.sunset,
      dailyForecast: data.daily?.slice(0, 8).map((day: any) => ({
        date: day.dt,
        temp: {
          day: day.temp.day,
          min: day.temp.min,
          max: day.temp.max
        },
        weather: {
          main: day.weather[0].main,
          description: day.weather[0].description
        },
        pop: day.pop,
        snow: day.snow
      })),
      hourlyForecast: data.hourly?.slice(0, 24).map((hour: any) => ({
        time: hour.dt,
        temp: hour.temp,
        feelsLike: hour.feels_like,
        weather: {
          main: hour.weather[0].main,
          description: hour.weather[0].description
        },
        pop: hour.pop
      }))
    };

    return res.status(200).json(weather);
  } catch (error) {
    console.error("Weather API error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
}
