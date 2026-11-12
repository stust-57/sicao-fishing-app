import { NextResponse } from "next/server";

const BASE = "https://opendata.cwa.gov.tw/api/v1/rest/datastore";
const KEY = (process.env.CWA_API_KEY ?? "").trim();

async function cwa(id: string) {
  if (!KEY) throw new Error("尚未設定 CWA_API_KEY");
  const url = `${BASE}/${id}?Authorization=${encodeURIComponent(KEY)}&format=JSON`;
  const res = await fetch(
  url,
  id === "F-A0021-001"
    ? { cache: "no-store" }
    : { next: { revalidate: 1800 } }
);
  if (!res.ok) throw new Error(`CWA API 回應 ${res.status}`);
  return res.json();
}
function findValue(location: any, names: string[]) {
  const elements = location?.weatherElement ?? [];
  for (const name of names) {
    const el = elements.find((x: any) => x.elementName === name);
    const value = el?.time?.[0]?.parameter?.parameterName ?? el?.time?.[0]?.elementValue?.[0]?.value;
    if (value !== undefined) return String(value);
  }
  return undefined;
}
function getWeatherValue(
  location: any,
  elementNames: string[],
  valueKeys: string[]
) {
  const elements = Array.isArray(location?.WeatherElement)
    ? location.WeatherElement
    : [];

  const element = elements.find((item: any) =>
    elementNames.includes(item.ElementName)
  );

  const firstTime = Array.isArray(element?.Time)
    ? element.Time[0]
    : null;

  const value = Array.isArray(firstTime?.ElementValue)
    ? firstTime.ElementValue[0]
    : null;

  if (!value) return null;

  for (const key of valueKeys) {
    if (value[key] !== undefined) return String(value[key]);
  }

  return null;
}
export async function GET() {
  if (!KEY) return NextResponse.json({
    configured: false,
    message: "尚未設定 CWA_API_KEY。請先申請中央氣象署授權碼並設定伺服器環境變數。",
    weather: null, tides: []
  }, { status: 200 });
  try {
    const [weatherResult, tideResult] = await Promise.allSettled([
      cwa("F-D0047-079"),
      cwa("F-A0021-001")
    ]);
    if (weatherResult.status === "rejected") {
      console.error("Weather API error:", weatherResult.reason);
    }

    if (tideResult.status === "rejected") {
      console.error("Tide API error:", tideResult.reason);
    }
   let weather = null;

if (weatherResult.status === "fulfilled") {
  const rawLocations =
    weatherResult.value?.records?.Locations?.[0]?.Location ?? [];

  const locations = Array.isArray(rawLocations)
    ? rawLocations
    : rawLocations
      ? [rawLocations]
      : [];

  const preferred =
    locations.find((x: any) =>
      ["安平區", "安南區"].includes(x.LocationName)
    ) ?? locations[0]
  console.log(
  "CWA 天氣項目：",
  (preferred.WeatherElement ?? []).map((item: any) => ({
    name: item.ElementName,
    value: item.Time?.[0]?.ElementValue?.[0]
  }))
);

  if (preferred) {
    weather = {
  location: preferred.LocationName,
  description: getWeatherValue(
    preferred,
    ["天氣現象"],
    ["Weather"]
  ),
  temperature: getWeatherValue(
    preferred,
    ["平均溫度"],
    ["Temperature"]
  ),
  wind: getWeatherValue(
  preferred,
  ["風速"],
  ["WindSpeed"]
),
windDirection: getWeatherValue(
  preferred,
  ["風向"],
  ["WindDirection"]
),
rainProbability: getWeatherValue(
  preferred,
  ["12小時降雨機率"],
  ["ProbabilityOfPrecipitation"]
),
  humidity: getWeatherValue(
    preferred,
    ["平均相對濕度"],
    ["RelativeHumidity"]
  ),
  updatedAt: new Date().toISOString()
};
  }
}

let tides: any[] = [];

if (tideResult.status === "fulfilled") {
  const forecasts =
    tideResult.value?.records?.TideForecasts ?? [];

  const allLocations = forecasts.flatMap((item: any) => {
    const raw = item.Location;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  });

  // 篩選台南附近測站
  const preferredLocations = allLocations.filter((loc: any) => {
  const name = loc.LocationName ?? "";
  return name.includes("臺南市安南區");
});

  const locations = preferredLocations.length
    ? preferredLocations
    : allLocations;

  tides = locations.flatMap((loc: any) => {
    const daily = loc.TimePeriods?.Daily ?? [];

    return daily.flatMap((day: any) => {
      const times = Array.isArray(day.Time) ? day.Time : [];

      return times.map((t: any) => ({
        location: loc.LocationName ?? "潮汐測站",
        date: day.Date ?? "",
        dateTime: t.DateTime ?? "",
        tide: t.Tide ?? "",
        height: t.TideHeights?.AboveChartDatum ?? "",
        range: day.TideRange ?? ""
      }));
    });
  }).filter((t: any) => {
  if (!t.dateTime) return false;

  const taipeiDate = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);

  const today = taipeiDate(new Date());
  const nextWeek = taipeiDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const date = t.dateTime.slice(0, 10);

  return date >= today && date <= nextWeek;
}).sort((a: any, b: any) => {
  return (
    new Date(a.dateTime).getTime() -
    new Date(b.dateTime).getTime()
  );
}).slice(0, 40);
}
return NextResponse.json({
  configured: true,
  weather,
  tides,
  warnings: [
    weatherResult.status === "rejected" ? "天氣資料暫時無法取得" : null,
    tideResult.status === "rejected" ? "潮汐資料暫時無法取得" : null
  ].filter(Boolean)
}, {
  headers: {
    "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600"
  }
});

} catch (error) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "資料讀取失敗" },
    { status: 502 }
  );
}
}