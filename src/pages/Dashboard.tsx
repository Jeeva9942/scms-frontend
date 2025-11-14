import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Thermometer, Wind, Activity ,CloudRain,Waves, Sun, Cloud, Snowflake, CloudFog, CloudSunRain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { desmakai } from "../ai/desmak.js";
import Chatbot from "@/components/ui/chatbot.tsx";
import FieldDashboard from "@/components/ui/FieldDashboard.tsx";
import  Mantoauto  from "@/pages/mantoauto.tsx";
import Mobsms from "@/sms/mobsms.tsx";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import sensorImg1 from "@/assets/wheat.jpg";
import sensorImg2 from "@/assets/greengram.jpg";
import sensorImg3 from "@/assets/coriander.jpg";
import sensorImg4 from "@/assets/rice.jpg";


const sensorData = [
  { id: 1, lat: 28.6, lng: 77.2, moisture: 65, temp: 28, status: "good" },
  { id: 2, lat: 28.62, lng: 77.18, moisture: 45, temp: 30, status: "warning" },
  { id: 3, lat: 28.58, lng: 77.22, moisture: 75, temp: 26, status: "excellent" },
  { id: 4, lat: 28.61, lng: 77.21, moisture: 35, temp: 32, status: "critical" },
  { id: 5, lat: 28.59, lng: 77.19, moisture: 55, temp: 29, status: "good" },
];



const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-growth/20 border-growth";
    case "good":
      return "bg-primary/20 border-primary";
    case "warning":
      return "bg-harvest/20 border-harvest";
    case "critical":
      return "bg-destructive/20 border-destructive";
    default:
      return "bg-muted";
  }
};


type OWListItem = {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number; };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
};

type OWResponse = {
  city?: { name?: string; country?: string };
  list: OWListItem[];
};

const Dashboard = () => {
  const [inputValue, setInputValue] = useState('');
  const { t } = useLanguage();
  const avgMoisture = Math.round(
    sensorData.reduce((acc, sensor) => acc + sensor.moisture, 0) / sensorData.length
  );
  const avgTemp = Math.round(
    sensorData.reduce((acc, sensor) => acc + sensor.temp, 0) / sensorData.length
  );
 const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    const res=await desmakai(inputValue);
    if(res){
    console.log(res); 
    }
    console.log("no res")
    // You can add your API call or logic here
    setInputValue(''); // clear input after submit
  };



  const [irrigationMode, setIrrigationMode] = useState("automatic");
  const [forecast, setForecast] = useState<OWResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "weather" | "humidity" | null>(null);
  const [days, setDays] = useState<number>(0);

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const cityId = 524901; // default ID; will be used if geolocation is unavailable

  const fetchForecast = async (lat?: number, lon?: number) => {
    try {
      setLoadingWeather(true);
      setWeatherError(null);
      const backendUrl = lat && lon
        ? `${API_BASE}/api/weather?lat=${lat}&lon=${lon}`
        : `${API_BASE}/api/weather?id=${cityId}`;

      let data: OWResponse | null = null;
      const res: Response | null = await fetch(backendUrl).catch(() => null);
      if (res && res.ok) {
        data = (await res.json()) as OWResponse;
      }

      if (!data) {
        const openWeatherBase = "https://api.openweathermap.org/data/2.5/forecast";
        const directUrl = lat && lon
          ? `${openWeatherBase}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
          : `${openWeatherBase}?id=${cityId}&appid=${apiKey}&units=metric`;
        if (!apiKey) {
          setWeatherError("Weather API key missing");
          setLoadingWeather(false);
          return;
        }
        const res2 = await fetch(directUrl);
        if (!res2.ok) {
          setWeatherError("Failed to load weather data");
          setForecast(null);
          return;
        }
        data = (await res2.json()) as OWResponse;
      }

      setForecast(data);
    } catch (e) {
      setWeatherError("Unable to fetch weather data");
    } finally {
      setLoadingWeather(false);
    }
  };

  const entriesForDays = (list: OWListItem[], d: number) => {
    const perDay = 8;
    const count = Math.max(0, Math.min(list.length, d * perDay));
    return list.slice(0, count);
  };

  const metricValue = (m: "temperature" | "weather" | "humidity", item: OWListItem) => {
    if (m === "temperature") return `${Math.round(item.main.temp)}°C`;
    if (m === "humidity") return `${Math.round(item.main.humidity)}%`;
    return item.weather?.[0]?.description ?? "";
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchForecast(pos.coords.latitude, pos.coords.longitude),
        () => fetchForecast(),
        { timeout: 5000 }
      );
    } else {
      fetchForecast();
    }
  };

  const weatherIconFor = (id: number) => {
    if (id >= 200 && id < 300) return CloudSunRain; // thunder
    if (id >= 300 && id < 600) return CloudRain; // drizzle/rain
    if (id >= 600 && id < 700) return Snowflake; // snow
    if (id >= 700 && id < 800) return CloudFog; // atmosphere
    if (id === 800) return Sun; // clear
    return Cloud; // clouds
  };

  // Load weather on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!forecast && selectedMetric && days > 0 && !loadingWeather) {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric, days]);

  return (
    <div className="min-h-screen bg-gradient-hero pt-24">
      <Mantoauto mode={irrigationMode} onChange={setIrrigationMode} />
     
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t.farmDashboard}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.farmDashboardDesc}
          </p>
          <p className="text-muted-foreground text-lg">
           
          </p>
        </div>
       
        {/* Stats Overview */}
      {/* Sensor Stats - Single Row */}
<div className="flex flex-wrap md:flex-nowrap justify-between gap-6 mb-8 overflow-x-auto">
  <Card className="shadow-soft flex-1 min-w-[220px]">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{t.avgMoisture}</CardTitle>
      <Droplets className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{avgMoisture}%</div>
      <p className="text-xs text-muted-foreground">{t.optimalRange}</p>
    </CardContent>
  </Card>

  <Card className="shadow-soft flex-1 min-w-[220px]">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{t.avgTemperature}</CardTitle>
      <Thermometer className="h-4 w-4 text-harvest" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-harvest">{avgTemp}°C</div>
      <p className="text-xs text-muted-foreground">{t.currentConditions}</p>
    </CardContent>
  </Card>

  
<Card className="shadow-soft flex-1 min-w-[220px]">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">{t.rainDropSensor}</CardTitle>
    <CloudRain className="h-4 w-4 text-primary" />
  </CardHeader>

  <CardContent>
    <div className="text-2xl font-bold text-primary">
      {t.rainDropSensorno}
    </div>
    <p className="text-xs text-muted-foreground">{t.raincurrentconditions}</p>
  </CardContent>
</Card>


<Card className="shadow-soft flex-1 min-w-[220px]">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">{t.waterLevelStatus}</CardTitle>
    <Waves className="h-5 w-5 text-harvest" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-harvest">70%</div>
    <p className="text-xs text-muted-foreground">{t.currentWaterLevel}</p>
  </CardContent>
</Card>

  <Card className="shadow-soft flex-1 min-w-[220px]">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{t.alerts}</CardTitle>
      <Wind className="h-4 w-4 text-destructive" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-destructive">
        {sensorData.filter((s) => s.status === "critical").length}
      </div>
      <p className="text-xs text-muted-foreground">{t.needsAttention}</p>
    </CardContent>
  </Card>
  
</div>

        <div className="mb-10">
          <Card className="border-0 shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Real-Time Weather</CardTitle>
              <CardDescription className="text-sm">
                {forecast?.city?.name ? `${forecast.city.name} • ${forecast.city.country ?? ""}` : "Local conditions"}
              </CardDescription>
              <div className="mt-3 flex flex-col gap-4">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  <button onClick={() => { setSelectedMetric("temperature"); if (!days) setDays(1); }} className={`min-w-[220px] rounded-xl p-4 border transition ${selectedMetric === "temperature" ? "bg-primary/10 border-primary" : "bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center animate-pulse"><Thermometer className="w-6 h-6 text-primary" /></div>
                      <div className="font-semibold">Temperature</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Tap to view forecast</div>
                  </button>
                  <button onClick={() => { setSelectedMetric("weather"); if (!days) setDays(1); }} className={`min-w-[220px] rounded-xl p-4 border transition ${selectedMetric === "weather" ? "bg-primary/10 border-primary" : "bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center animate-bounce"><Sun className="w-6 h-6 text-yellow-500" /></div>
                      <div className="font-semibold">Conditions</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Sunny, rainy, cloudy</div>
                  </button>
                  <button onClick={() => { setSelectedMetric("humidity"); if (!days) setDays(1); }} className={`min-w-[220px] rounded-xl p-4 border transition ${selectedMetric === "humidity" ? "bg-primary/10 border-primary" : "bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/15 flex items-center justify-center animate-pulse"><Droplets className="w-6 h-6 text-cyan-600" /></div>
                      <div className="font-semibold">Humidity</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Tap to view forecast</div>
                  </button>
                </div>
                <div className="w-[160px]">
                  <Select onValueChange={(v) => setDays(parseInt(v))} value={days ? String(days) : undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWeather && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">Loading weather…</div>
              )}
              {!loadingWeather && weatherError && (
                <div className="text-destructive text-sm">{weatherError}</div>
              )}

              {!loadingWeather && forecast && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1 bg-muted/40 rounded-xl p-5">
                    {(() => {
                      const first = forecast.list?.[0];
                      if (!first) return null;
                      const Icon = weatherIconFor(first.weather?.[0]?.id ?? 800);
                      return (
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <div className="text-3xl font-bold">{Math.round(first.main.temp)}°C</div>
                            <div className="text-sm text-muted-foreground capitalize">{first.weather?.[0]?.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">Feels {Math.round(first.main.feels_like)}°C • Humidity {first.main.humidity}%</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="col-span-2 md:col-span-3">
                    {selectedMetric && days > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {entriesForDays(forecast.list, days).map((item) => {
                          const Icon = weatherIconFor(item.weather?.[0]?.id ?? 800);
                          const time = new Date(item.dt * 1000).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
                          return (
                            <div key={item.dt} className="bg-card border rounded-xl p-3 text-center shadow-soft">
                              <div className="text-xs text-muted-foreground">{time}</div>
                              <Icon className="w-6 h-6 mx-auto my-2 text-foreground" />
                              <div className="text-lg font-semibold">{metricValue(selectedMetric, item)}</div>
                              <div className="text-[11px] text-muted-foreground">Wind {Math.round(item.wind.speed)} m/s</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Field Dashboard Below */}
        <div className="mt-8">
          <FieldDashboard />
        </div>

        <div className="mt-10">
          <Card className="border-0 shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Soil Sensor Map</CardTitle>
              <CardDescription className="text-sm">Interactive view of irrigated and non‑irrigated fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
                <div className="rounded-xl overflow-hidden border shadow-soft">
                  <div className="h-28 sm:h-32 bg-cover bg-center" style={{ backgroundImage: `url(${sensorImg1})` }}>
                    <div className="h-full w-full bg-blue-400/40 ring-1 ring-blue-500/50 flex items-center justify-center">
                      <div className="text-sm font-semibold">SENSOR - 1</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border shadow-soft">
                  <div className="h-28 sm:h-32 bg-cover bg-center" style={{ backgroundImage: `url(${sensorImg2})` }}>
                    <div className="h-full w-full bg-blue-400/40 ring-1 ring-blue-500/50 flex items-center justify-center">
                      <div className="text-sm font-semibold">SENSOR - 2</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border shadow-soft">
                  <div className="h-28 sm:h-32 bg-cover bg-center" style={{ backgroundImage: `url(${sensorImg3})` }}>
                    <div className="h-full w-full bg-blue-400/40 ring-1 ring-blue-500/50 flex items-center justify-center">
                      <div className="text-sm font-semibold">SENSOR - 3</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border shadow-soft">
                  <div className="h-28 sm:h-32 bg-cover bg-center" style={{ backgroundImage: `url(${sensorImg4})` }}>
                    <div className="h-full w-full bg-red-400/40 ring-1 ring-red-500/50 flex items-center justify-center">
                      <div className="text-sm font-semibold">SENSOR - 4</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm bg-blue-300 border"></span>
                  <span className="text-sm">Irrigated Field</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-sm bg-red-300 border"></span>
                  <span className="text-sm">Non‑Irrigated Field</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
</div>
      <Mobsms />
    <Chatbot />
    </div>
  );
};

export default Dashboard;
