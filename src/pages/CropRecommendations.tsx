import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Calendar, ThermometerSun, Droplets, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Chatbot from "@/components/ui/chatbot";


const cropData = [
  {
    name: "Rice",
    profitability: "High",
    season: "Kharif (June-October)",
    waterNeed: "High",
    temperature: "21-37°C",
    soilType: "Clay loam",
    expectedYield: "4-6 tons/hectare",
    marketPrice: "₹2,000-2,500/quintal",
    difficulty: "Medium",
    roi: "35-40%",
  },
  {
    name: "Wheat",
    profitability: "High",
    season: "Rabi (November-April)",
    waterNeed: "Medium",
    temperature: "15-25°C",
    soilType: "Loamy",
    expectedYield: "3-5 tons/hectare",
    marketPrice: "₹1,800-2,200/quintal",
    difficulty: "Easy",
    roi: "30-35%",
  },
  {
    name: "Capsicum (Bell Pepper)",
    profitability: "High",
    season: "Year-round",
    waterNeed: "Medium",
    temperature: "18-30°C",
    soilType: "Sandy loam",
    expectedYield: "15-25 tons/hectare",
    marketPrice: "₹2,000-4,000/quintal",
    difficulty: "Medium",
    roi: "40-50%",
  },
  {
    name: "Sugarcane",
    profitability: "Very High",
    season: "Year-round",
    waterNeed: "High",
    temperature: "20-30°C",
    soilType: "Loamy",
    expectedYield: "70-80 tons/hectare",
    marketPrice: "₹280-320/quintal",
    difficulty: "Medium",
    roi: "40-45%",
  },
  {
    name: "Tomato",
    profitability: "High",
    season: "Year-round",
    waterNeed: "Medium",
    temperature: "20-27°C",
    soilType: "Sandy loam",
    expectedYield: "25-35 tons/hectare",
    marketPrice: "₹800-1,500/quintal",
    difficulty: "Medium",
    roi: "50-60%",
  },
  {
    name: "Maize",
    profitability: "Medium",
    season: "Kharif & Rabi",
    waterNeed: "Medium",
    temperature: "18-27°C",
    soilType: "Well-drained loam",
    expectedYield: "5-7 tons/hectare",
    marketPrice: "₹1,400-1,800/quintal",
    difficulty: "Easy",
    roi: "25-30%",
  },
];


const getProfitabilityColor = (level: string) => {
  switch (level) {
    case "Very High":
      return "bg-growth text-white";
    case "High":
      return "bg-primary text-white";
    case "Medium":
      return "bg-harvest text-white";
    default:
      return "bg-muted";
  }
};

const CropRecommendations = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-hero pt-24">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t.aiCropRecommendations}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.aiCropRecommendationsDesc}
          </p>
        </div>

        {/* Current Conditions */}
        <Card className="shadow-medium mb-8">
          <CardHeader>
            <CardTitle>{t.yourFarmConditions}</CardTitle>
            <CardDescription>
              {t.yourFarmConditionsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.soilMoisture}</p>
                  <p className="font-semibold">58%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-harvest/10 rounded-lg">
                  <ThermometerSun className="h-6 w-6 text-harvest" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.temperature}</p>
                  <p className="font-semibold">28°C</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-growth/10 rounded-lg">
                  <Info className="h-6 w-6 text-growth" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.soilType}</p>
                  <p className="font-semibold">Loamy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-sky" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.season}</p>
                  <p className="font-semibold">Rabi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cropData.map((crop, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl">{crop.name}</CardTitle>
                  <Badge className={getProfitabilityColor(crop.profitability)}>
                    {crop.profitability}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t.roi}: {crop.roi}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.season}:</span>
                    <span className="font-medium">{crop.season}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.waterNeed}:</span>
                    <span className="font-medium">{crop.waterNeed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.temperature}:</span>
                    <span className="font-medium">{crop.temperature}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.soilType}:</span>
                    <span className="font-medium">{crop.soilType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.difficulty}:</span>
                    <span className="font-medium">{crop.difficulty}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-growth mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">{t.expectedYield}</p>
                      <p className="text-muted-foreground">{crop.expectedYield}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-harvest mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">{t.marketPrice}</p>
                      <p className="text-muted-foreground">{crop.marketPrice}</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-primary">
                  {t.viewDetails}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Chatbot/>
  
    </div>
  );
};

export default CropRecommendations;
