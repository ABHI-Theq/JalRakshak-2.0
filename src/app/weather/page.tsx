"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CloudRain,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const glass =
  "rounded-2xl border border-black bg-white/20 shadow-xl ring-1 ring-black/20 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:ring-white/10";

type WeatherData = {
  current?: {
    temperature: number;
    precipitation: number;
    wind: number;
    code?: number;
  };
  sumNext24h: number;
  locationName?: string;
};

type AnnualRainfallData = {
  location?: string;
  annualRainfall?: number;
  monthlyData?: { month: string; rainfall: number }[];
  loading?: boolean;
  error?: string;
};

export default function Page() {
  const { t,i18n } = useTranslation();
  const [query, setQuery] = useState("New Delhi, IN");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rainfallData, setRainfallData] = useState<AnnualRainfallData>({});

  const rainExpected = useMemo(
    () => (data?.sumNext24h ?? 0) >= 1,
    [data?.sumNext24h]
  );

  async function fetchAnnualRainfall(
    lat: number,
    lon: number,
    locationName: string
  ) {
    try {
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      const endDate = new Date(currentDate.getFullYear() - 1, 11, 31);

      const rainfallUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate
        .toISOString()
        .split("T")[0]}&end_date=${endDate
        .toISOString()
        .split("T")[0]}&daily=precipitation_sum&timezone=auto`;

      const rainfallRes = await fetch(rainfallUrl);
      const rainfallJson = await rainfallRes.json();

      const dailyPrecipitation = rainfallJson?.daily?.precipitation_sum || [];
      const annualTotal = dailyPrecipitation.reduce(
        (sum: number, val: number) => sum + (val || 0),
        0
      );

      const monthlyData = [
        { month: "Jan", rainfall: 0 },
        { month: "Feb", rainfall: 0 },
        { month: "Mar", rainfall: 0 },
        { month: "Apr", rainfall: 0 },
        { month: "May", rainfall: 0 },
        { month: "Jun", rainfall: 0 },
        { month: "Jul", rainfall: 0 },
        { month: "Aug", rainfall: 0 },
        { month: "Sep", rainfall: 0 },
        { month: "Oct", rainfall: 0 },
        { month: "Nov", rainfall: 0 },
        { month: "Dec", rainfall: 0 },
      ];

      const monthlyDistribution = [2, 3, 5, 8, 15, 25, 30, 25, 20, 8, 3, 2];
      monthlyData.forEach((month, index) => {
        month.rainfall = Math.round(
          (annualTotal * monthlyDistribution[index]) / 100
        );
      });

      setRainfallData({
        location: locationName,
        annualRainfall: Math.round(annualTotal),
        monthlyData,
        loading: false,
      });
    } catch (err: any) {
      setRainfallData({
        error: err?.message || "Failed to fetch rainfall data",
        loading: false,
      });
    }
  }

  async function geocodeAndFetch() {
    try {
      setError(null);
      setLoading(true);
      setRainfallData({ loading: true });

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url);
      const json = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name?: string;
      }>;
      if (!json[0]) throw new Error("Location not found");
      const lat = parseFloat(json[0].lat);
      const lon = parseFloat(json[0].lon);
      setCoords({ lat, lon });

      const meteo = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation,temperature_2m&forecast_days=2&timezone=auto`
      );
      const m = await meteo.json();
      const pr: number[] = m?.hourly?.precipitation ?? [];
      const sumNext24h = pr
        .slice(0, 24)
        .reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      const current = {
        temperature: m?.current?.temperature_2m ?? 0,
        precipitation: m?.current?.precipitation ?? 0,
        wind: m?.current?.wind_speed_10m ?? 0,
        code: m?.current?.weather_code,
      };
      setData({ current, sumNext24h, locationName: json[0].display_name });

      await fetchAnnualRainfall(lat, lon, json[0].display_name || "Unknown");
    } catch (e: any) {
      setError(e?.message || "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between text-black dark:text-blue-100">
        <div className="flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          <span className="text-xl font-bold">{t("navWeather")}</span>
        </div>
        <div className="text-xs text-blue-900/70 dark:text-blue-100/70">
          {t("weatherSubtitle")}
        </div>
      </header>

      {/* Location input */}
      <section
        className={`mb-6 p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20 text-black dark:text-blue-100`}
      >
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
          <MapPin className="h-5 w-5" /> {t("enterLocation")}
        </h2>
        <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
          {t("weatherHelp")}
        </p>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            geocodeAndFetch();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-black bg-white/40 px-3 text-sm text-black placeholder-black/50 outline-none ring-1 ring-black/20 backdrop-blur focus:border-black focus:ring-black/30 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
            placeholder={t("enterLocationPlaceholder")}
          />
          <Button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? t("loading") : t("getAllWeatherData")}
          </Button>
        </form>
      </section>

      {error && (
        <div
          className={`mb-6 p-4 ${glass} text-sm text-red-700 dark:text-red-300 border border-black ring-black/20`}
        >
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Current Weather */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}
            >
              <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">
                {t("currentConditions")}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-black dark:text-blue-100">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" /> {data.current?.temperature}
                  °C
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4" /> {data.current?.wind} km/h
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />{" "}
                  {data.current?.precipitation} mm
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" /> Code: {data.current?.code}
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div
              className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}
            >
              <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">
                {t("location")}
              </h3>
              <p className="text-sm text-black/80 dark:text-blue-100/80">
                {data.locationName}
              </p>
              <p className="mt-2 text-xs text-blue-900/70 dark:text-blue-100/70">
                {coords
                  ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                  : "—"}
              </p>
            </div>

            {/* Rain Forecast */}
            <div
              className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}
            >
              <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">
                {t("rainAlert24h")}
              </h3>
              <p className="text-3xl font-extrabold text-black dark:text-blue-300">
                {data.sumNext24h.toFixed(1)} mm
              </p>
              <p className="mt-2 text-sm text-blue-900/80 dark:text-blue-100/80">
                {rainExpected ? t("rainExpected24h") : t("noRain24h")}
              </p>
            </div>
          </section>

          {/* Annual Rainfall */}
          {rainfallData.loading && (
            <div className={`p-6 ${glass} text-center`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                {t("fetchingAnnualRainfall")}
              </p>
            </div>
          )}

          {rainfallData.error && (
            <div
              className={`p-4 ${glass} text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800`}
            >
              {rainfallData.error}
            </div>
          )}

          {rainfallData.annualRainfall && (
            <section
              className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
                <Calendar className="h-5 w-5" /> {t("annualRainfallAnalysis")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    <BarChart3 className="h-4 w-4" /> {t("annualTotal")}
                  </h3>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {rainfallData.annualRainfall} mm
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {rainfallData.location}
                  </p>
                </div>

                <div className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20`}>
                  <h3 className="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
                    {t("waterHarvestingPotential")}
                  </h3>
                  <p className="text-lg text-green-700 dark:text-green-300">
                    {Math.round(rainfallData.annualRainfall * 0.8)} L/m²/year
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ({t("runoffCoefficient80")})
                  </p>
                </div>
              </div>

              {rainfallData.monthlyData && (
                <div>
                  <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    {t("monthlyRainfallDistribution")}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {rainfallData.monthlyData.map((month, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                          {month.month}
                        </div>
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {month.rainfall}mm
                        </div>
                        <div
                          className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-1"
                          style={{
                            width: "100%",
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                              (month.rainfall /
                                Math.max(
                                  ...rainfallData!.monthlyData!.map(
                                    (m) => m.rainfall
                                  )
                                )) *
                              100
                            }%, #e5e7eb ${
                              (month.rainfall /
                                Math.max(
                                  ...rainfallData!.monthlyData!.map(
                                    (m) => m.rainfall
                                  )
                                )) *
                              100
                            }%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
