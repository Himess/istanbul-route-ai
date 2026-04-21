/**
 * Weather client using Open-Meteo (free, no API key).
 * Returns current conditions at a given lat/lng + 1-hour forecast.
 */

interface WeatherSnapshot {
  temperature: number; // °C
  windSpeed: number; // km/h
  precipitation: number; // mm
  weatherCode: number; // WMO code
  description: string;
  isRaining: boolean;
  isSnowing: boolean;
  visibility: "good" | "reduced" | "poor";
  fetchedAt: number;
}

// WMO codes: https://open-meteo.com/en/docs
function codeToDescription(code: number): string {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

class WeatherClient {
  private cache: Map<string, { data: WeatherSnapshot; fetchedAt: number }> = new Map();
  private ttl = 10 * 60 * 1000; // 10 minutes

  async getCurrent(lat: number, lng: number): Promise<WeatherSnapshot> {
    // Round to 2 decimal places for cache key (~1km grid)
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < this.ttl) {
      return cached.data;
    }

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lng}&` +
        `current=temperature_2m,precipitation,wind_speed_10m,weather_code&` +
        `timezone=Europe%2FIstanbul`;

      const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as {
        current: {
          temperature_2m: number;
          precipitation: number;
          wind_speed_10m: number;
          weather_code: number;
        };
      };

      const c = data.current;
      const code = c.weather_code;
      const description = codeToDescription(code);
      const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
      const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);

      let visibility: WeatherSnapshot["visibility"] = "good";
      if ([45, 48].includes(code) || c.precipitation > 2) visibility = "poor";
      else if (isRaining || isSnowing) visibility = "reduced";

      const snapshot: WeatherSnapshot = {
        temperature: Math.round(c.temperature_2m * 10) / 10,
        windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
        precipitation: Math.round(c.precipitation * 10) / 10,
        weatherCode: code,
        description,
        isRaining,
        isSnowing,
        visibility,
        fetchedAt: Date.now(),
      };

      this.cache.set(key, { data: snapshot, fetchedAt: Date.now() });
      return snapshot;
    } catch (err) {
      console.error("[Weather] Fetch failed:", err);
      // Return neutral default instead of throwing — agent can still reason
      return {
        temperature: 15,
        windSpeed: 5,
        precipitation: 0,
        weatherCode: 0,
        description: "Unknown (weather service unavailable)",
        isRaining: false,
        isSnowing: false,
        visibility: "good",
        fetchedAt: Date.now(),
      };
    }
  }
}

export const weatherClient = new WeatherClient();
export type { WeatherSnapshot };
