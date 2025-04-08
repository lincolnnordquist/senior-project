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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: "Error fetching weather data", error: data });
    }

    const weather = {
      temperature: data.main?.temp,
      description: data.weather?.[0]?.description,
      windSpeed: data.wind?.speed,
    };

    return res.status(200).json(weather);
  } catch (error) {
    console.error("Weather API error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
}
