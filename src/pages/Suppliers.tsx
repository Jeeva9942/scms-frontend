import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Star, Package, Sprout, Truck, Search, Loader2, ExternalLink, Navigation } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { desmakai } from "@/ai/desmak";
import Chatbot from "@/components/ui/chatbot";
// Base supplier data with fixed locations (lat/lng for distance calculation)
const baseSupplierData = [
  {
    name: "Green Valley Seeds",
    type: "Seeds",
    rating: 4.8,
    lat: 28.6139,
    lng: 77.2090,
    city: "Delhi",
    address: "123, Connaught Place, New Delhi - 110001",
    products: ["Rice Seeds", "Wheat Seeds", "Corn Seeds"],
    verified: true,
    phone: "+91 98765 43210",
    email: "contact@greenvalleyseeds.com",
    priceRange: "₹₹",
    priceInfo: "Starting from ₹500/kg",
    openingHours: "Mon-Sat: 9 AM - 7 PM",
  },
  {
    name: "FarmChem Fertilizers",
    type: "Fertilizers",
    rating: 4.6,
    lat: 28.5355,
    lng: 77.3910,
    city: "Noida",
    address: "Sector 18, Noida - 201301",
    products: ["NPK", "Urea", "Organic Compost"],
    verified: true,
    phone: "+91 98765 43211",
    email: "info@farmchem.in",
    priceRange: "₹₹₹",
    priceInfo: "Starting from ₹800/bag",
    openingHours: "Mon-Sat: 8 AM - 8 PM",
  },
  {
    name: "AgriTech Equipment",
    type: "Equipment",
    rating: 4.9,
    lat: 28.4089,
    lng: 77.0378,
    city: "Gurgaon",
    address: "Sohna Road, Gurgaon - 122001",
    products: ["Tractors", "Irrigation Systems", "Sprayers"],
    verified: true,
    phone: "+91 98765 43212",
    email: "sales@agritechequip.com",
    priceRange: "₹₹₹₹",
    priceInfo: "Contact for pricing",
    openingHours: "Mon-Sat: 10 AM - 6 PM",
  },
  {
    name: "Organic Roots",
    type: "Fertilizers",
    rating: 4.7,
    lat: 28.4089,
    lng: 77.3178,
    city: "Faridabad",
    address: "NH-19, Faridabad - 121001",
    products: ["Organic Fertilizers", "Bio-pesticides", "Soil Conditioners"],
    verified: true,
    phone: "+91 98765 43213",
    email: "hello@organicroots.in",
    priceRange: "₹₹",
    priceInfo: "Starting from ₹600/bag",
    openingHours: "Mon-Sat: 9 AM - 7 PM",
  },
  {
    name: "Seed Mart India",
    type: "Seeds",
    rating: 4.5,
    lat: 28.7041,
    lng: 77.1025,
    city: "Delhi",
    address: "Karol Bagh, New Delhi - 110005",
    products: ["Vegetable Seeds", "Flower Seeds", "Hybrid Seeds"],
    verified: true,
    phone: "+91 98765 43214",
    email: "support@seedmartindia.com",
    priceRange: "₹₹",
    priceInfo: "Starting from ₹300/packet",
    openingHours: "Mon-Sat: 9 AM - 7 PM",
  },
  {
    name: "Modern Farm Tools",
    type: "Equipment",
    rating: 4.8,
    lat: 28.6692,
    lng: 77.4538,
    city: "Ghaziabad",
    address: "Raj Nagar, Ghaziabad - 201001",
    products: ["Hand Tools", "Power Tools", "Storage Solutions"],
    verified: true,
    phone: "+91 98765 43215",
    email: "info@modernfarmtools.com",
    priceRange: "₹₹₹",
    priceInfo: "Starting from ₹1,500",
    openingHours: "Mon-Sat: 9 AM - 7 PM",
  },
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Seeds":
      return <Sprout className="h-5 w-5" />;
    case "Fertilizers":
      return <Package className="h-5 w-5" />;
    case "Equipment":
      return <Truck className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Seeds":
      return "bg-growth/10 text-growth border-growth";
    case "Fertilizers":
      return "bg-harvest/10 text-harvest border-harvest";
    case "Equipment":
      return "bg-primary/10 text-primary border-primary";
    default:
      return "bg-muted";
  }
};

const Suppliers = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [locationData, setLocationData] = useState<{ city?: string; state?: string; district?: string; lat?: number; lng?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch location data from pincode using desmak.js
  const fetchLocationFromPincode = async (pin: string) => {
    if (!pin || pin.length !== 6) return;
    
    setLoading(true);
    try {
      // First try to get location from pincode prefix mapping (faster fallback)
      const defaultLocation = getDefaultLocationFromPincode(pin);
      
      // Use desmak.js to get more accurate location data
      const prompt = `For Indian pincode ${pin}, provide the exact location details. Give me: 1. City name, 2. State name, 3. District name, 4. Latitude coordinate, 5. Longitude coordinate. Format exactly as: City: [name], State: [name], District: [name], Latitude: [number], Longitude: [number]. If you don't know the exact coordinates, use approximate values based on the city location.`;
      
      const response = await desmakai(prompt);
      
      // Parse the response to extract location data with multiple patterns
      const cityMatch = response.match(/City:\s*([^,\n]+)/i) || response.match(/city[:\s]+([^,\n]+)/i);
      const stateMatch = response.match(/State:\s*([^,\n]+)/i) || response.match(/state[:\s]+([^,\n]+)/i);
      const districtMatch = response.match(/District:\s*([^,\n]+)/i) || response.match(/district[:\s]+([^,\n]+)/i);
      const latMatch = response.match(/Latitude:\s*([0-9.]+)/i) || response.match(/lat[itude]*[:\s]+([0-9.]+)/i);
      const lngMatch = response.match(/Longitude:\s*([0-9.]+)/i) || response.match(/lon[gitude]*[:\s]+([0-9.]+)/i);
      
      const location = {
        city: cityMatch ? cityMatch[1].trim() : defaultLocation.city,
        state: stateMatch ? stateMatch[1].trim() : defaultLocation.state,
        district: districtMatch ? districtMatch[1].trim() : undefined,
        lat: latMatch ? parseFloat(latMatch[1]) : defaultLocation.lat,
        lng: lngMatch ? parseFloat(lngMatch[1]) : defaultLocation.lng,
      };
      
      // Always update with the location data we got
      setLocationData(location);
      if (location.lat && location.lng) {
        // Don't stop loading here - let updateSupplierLocations handle it
        await updateSupplierLocations(
          location.lat, 
          location.lng, 
          location.city || defaultLocation.city, 
          location.state || defaultLocation.state,
          pin
        );
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      // Fallback to default location
      const defaultLocation = getDefaultLocationFromPincode(pin);
      setLocationData(defaultLocation);
      if (defaultLocation.lat && defaultLocation.lng) {
        // Don't stop loading here - let updateSupplierLocations handle it
        await updateSupplierLocations(
          defaultLocation.lat, 
          defaultLocation.lng, 
          defaultLocation.city || "Unknown",
          defaultLocation.state || "Unknown",
          pin
        );
      } else {
        setLoading(false);
      }
    }
  };

  // Fallback function to get approximate location from pincode
  const getDefaultLocationFromPincode = (pin: string) => {
    // Extended mapping for common pincode ranges (first 2-3 digits)
    const pinPrefix = pin.substring(0, 2);
    const pinPrefix3 = pin.substring(0, 3);
    const locationMap: { [key: string]: { city: string; state: string; lat: number; lng: number } } = {
      "11": { city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
      "12": { city: "Gurgaon", state: "Haryana", lat: 28.4089, lng: 77.0378 },
      "13": { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
      "20": { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
      "40": { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
      "56": { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
      "60": { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
      "70": { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
      "38": { city: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794 },
      "30": { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
      "50": { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
      "80": { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
      "75": { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
      "64": { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
      "68": { city: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
      "14": { city: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
      "24": { city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
    };
    
    // Try 3-digit prefix first for more accuracy
    if (locationMap[pinPrefix3]) {
      return locationMap[pinPrefix3];
    }
    
    return locationMap[pinPrefix] || { city: "Unknown", state: "Unknown", lat: 28.6139, lng: 77.2090 };
  };

  // Generate location-specific suppliers based on pincode
  const generateLocationSpecificSuppliers = async (userLat: number, userLng: number, userCity: string, state: string, pin: string) => {
    try {
      // Use desmak.js to get suppliers for the specific location
      const prompt = `For pincode ${pin} in ${userCity}, ${state}, provide a list of 6-8 real agricultural suppliers (seed shops, fertilizer dealers, equipment sellers) in this area. For each supplier, provide: 1. Shop name, 2. Type (Seeds/Fertilizers/Equipment), 3. Address with pincode, 4. Phone number, 5. Products they sell (3-4 items), 6. Approximate latitude, 7. Approximate longitude. Format as: Name: [name], Type: [type], Address: [address], Phone: [phone], Products: [product1, product2, product3], Lat: [lat], Lng: [lng]. Separate each supplier with "---".`;
      
      const response = await desmakai(prompt);
      
      // Parse suppliers from response
      const suppliers = parseSuppliersFromResponse(response, userCity, state, pin, userLat, userLng);
      
      if (suppliers.length > 0) {
        // Calculate distances and update
        const updatedSuppliers = suppliers.map(supplier => {
          const distance = calculateDistance(userLat, userLng, supplier.lat, supplier.lng);
          const roundedDistance = Math.round(distance * 10) / 10;
          return {
            ...supplier,
            location: `${supplier.city}, ${roundedDistance} km away`,
            distance: roundedDistance
          };
        });
        
        // Sort by distance and filter within 100km
        updatedSuppliers.sort((a, b) => a.distance - b.distance);
        const nearbySuppliers = updatedSuppliers.filter(s => s.distance <= 100);
        
        const finalSuppliers = nearbySuppliers.length > 0 ? nearbySuppliers : updatedSuppliers.slice(0, 6);
        setSupplierData(finalSuppliers);
        setLoading(false); // Stop loading once suppliers are ready
      } else {
        // Fallback: Generate suppliers based on location
        const generatedSuppliers = generateSuppliersForLocation(userLat, userLng, userCity, state, pin);
        setSupplierData(generatedSuppliers);
        setLoading(false); // Stop loading once suppliers are ready
      }
    } catch (error) {
      console.error("Error generating location-specific suppliers:", error);
      // Fallback: Generate suppliers based on location
      const generatedSuppliers = generateSuppliersForLocation(userLat, userLng, userCity, state, pin);
      setSupplierData(generatedSuppliers);
      setLoading(false); // Stop loading once suppliers are ready
    }
  };

  // Parse suppliers from AI response
  const parseSuppliersFromResponse = (response: string, city: string, state: string, pin: string, userLat: number, userLng: number) => {
    const suppliers: any[] = [];
    // Remove ** and markdown formatting
    const cleanResponse = response.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
    const supplierBlocks = cleanResponse.split('---');
    
    supplierBlocks.forEach((block, index) => {
      const nameMatch = block.match(/Name:\s*([^\n,]+)/i) || block.match(/Shop[:\s]+([^\n,]+)/i);
      const typeMatch = block.match(/Type:\s*([^\n,]+)/i);
      const addressMatch = block.match(/Address:\s*([^\n]+)/i);
      const phoneMatch = block.match(/Phone:\s*([^\n,]+)/i) || block.match(/Phone[:\s]+([0-9+\s]+)/i);
      const productsMatch = block.match(/Products:\s*([^\n]+)/i);
      const latMatch = block.match(/Lat[itude]*:\s*([0-9.]+)/i);
      const lngMatch = block.match(/Lng[itude]*:\s*([0-9.]+)/i);
      
      if (nameMatch) {
        const products = productsMatch 
          ? productsMatch[1].split(',').map(p => p.trim().replace(/\*\*/g, '').replace(/\*/g, '')).filter(p => p)
          : ["Various Products"];
        
        const lat = latMatch ? parseFloat(latMatch[1]) : userLat + (Math.random() - 0.5) * 0.1;
        const lng = lngMatch ? parseFloat(lngMatch[1]) : userLng + (Math.random() - 0.5) * 0.1;
        
        const type = typeMatch ? typeMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, '') : (index % 3 === 0 ? "Seeds" : index % 3 === 1 ? "Fertilizers" : "Equipment");
        
        suppliers.push({
          name: nameMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, ''),
          type: type,
          rating: 4.5 + Math.random() * 0.5,
          lat: lat,
          lng: lng,
          city: city,
          address: addressMatch ? addressMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, '') : `${city}, ${state} - ${pin}`,
          products: products.slice(0, 4),
          verified: true,
          phone: phoneMatch ? phoneMatch[1].trim().replace(/\*\*/g, '').replace(/\*/g, '') : `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
          email: `contact@${nameMatch[1].trim().toLowerCase().replace(/\s+/g, '').replace(/\*\*/g, '')}.com`,
          priceRange: index % 3 === 0 ? "₹₹" : index % 3 === 1 ? "₹₹₹" : "₹₹₹₹",
          priceInfo: type === "Seeds" ? "Starting from ₹500/kg" : type === "Fertilizers" ? "Starting from ₹800/bag" : "Contact for pricing",
          openingHours: "Mon-Sat: 9 AM - 7 PM",
        });
      }
    });
    
    return suppliers;
  };

  // Generate suppliers for location (fallback)
  const generateSuppliersForLocation = (userLat: number, userLng: number, city: string, state: string, pin: string) => {
    const supplierTypes = [
      { type: "Seeds", names: ["Green Valley Seeds", "Seed Mart", "Premium Seeds Co", "Agri Seeds Hub"], products: ["Rice Seeds", "Wheat Seeds", "Corn Seeds", "Vegetable Seeds"] },
      { type: "Fertilizers", names: ["FarmChem Fertilizers", "Organic Roots", "Agri Nutrients", "Soil Care Solutions"], products: ["NPK", "Urea", "Organic Compost", "Bio-fertilizers"] },
      { type: "Equipment", names: ["AgriTech Equipment", "Modern Farm Tools", "Farm Machinery Hub", "Agri Solutions"], products: ["Tractors", "Irrigation Systems", "Sprayers", "Hand Tools"] },
    ];
    
    const suppliers: any[] = [];
    
    // Generate 6 suppliers (2 of each type)
    for (let i = 0; i < 6; i++) {
      const typeIndex = i % 3;
      const supplierType = supplierTypes[typeIndex];
      const nameIndex = Math.floor(i / 3);
      const name = supplierType.names[nameIndex] || supplierType.names[0];
      
      // Generate location slightly offset from user location (within 50km radius)
      const angle = (i * 60) * Math.PI / 180;
      const distance = 5 + Math.random() * 45; // 5-50 km
      const latOffset = (distance / 111) * Math.cos(angle);
      const lngOffset = (distance / 111) * Math.sin(angle);
      
      const distance_km = calculateDistance(userLat, userLng, userLat + latOffset, userLng + lngOffset);
      
      suppliers.push({
        name: `${name} - ${city}`,
        type: supplierType.type,
        rating: 4.5 + Math.random() * 0.5,
        lat: userLat + latOffset,
        lng: userLng + lngOffset,
        city: city,
        address: `${city}, ${state} - ${pin}`,
        products: supplierType.products,
        verified: true,
        phone: `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
        email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        priceRange: typeIndex === 0 ? "₹₹" : typeIndex === 1 ? "₹₹₹" : "₹₹₹₹",
        priceInfo: supplierType.type === "Seeds" ? "Starting from ₹500/kg" : supplierType.type === "Fertilizers" ? "Starting from ₹800/bag" : "Contact for pricing",
        openingHours: "Mon-Sat: 9 AM - 7 PM",
        location: `${city}, ${Math.round(distance_km * 10) / 10} km away`,
        distance: Math.round(distance_km * 10) / 10
      });
    }
    
    // Sort by distance
    suppliers.sort((a, b) => a.distance - b.distance);
    
    return suppliers;
  };

  // Update supplier locations based on pincode location
  const updateSupplierLocations = async (userLat: number, userLng: number, userCity: string, state?: string, pin?: string) => {
    if (pin && state) {
      // Generate location-specific suppliers - loading will be stopped inside this function
      await generateLocationSpecificSuppliers(userLat, userLng, userCity, state, pin);
    } else {
      // Fallback: Just calculate distances for existing suppliers
      const updatedSuppliers = baseSupplierData.map(supplier => {
        const distance = calculateDistance(userLat, userLng, supplier.lat, supplier.lng);
        const roundedDistance = Math.round(distance * 10) / 10;
        return {
          ...supplier,
          location: `${supplier.city}, ${roundedDistance} km away`,
          distance: roundedDistance
        };
      });
      
      updatedSuppliers.sort((a, b) => a.distance - b.distance);
      setSupplierData(updatedSuppliers);
      setLoading(false); // Stop loading once suppliers are ready
    }
  };

  // Open Google Maps with supplier location
  const openGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  // Handle phone call
  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setHasSearched(true);
      await fetchLocationFromPincode(pincode);
    }
  };

  const filteredSuppliers = supplierData.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !selectedType || supplier.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-hero pt-24">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t.reliableSuppliers}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.reliableSuppliersDesc}
          </p>
        </div>

        {/* Pincode Input */}
        <Card className="shadow-medium mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handlePincodeSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Enter Pincode to Find Nearby Suppliers
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter 6-digit pincode (e.g., 110001)"
                      value={pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(value);
                      }}
                      className="pl-10"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || pincode.length !== 6}
                    className="bg-gradient-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                {locationData && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      Showing suppliers near <strong className="text-foreground">{locationData.city}</strong>
                      {locationData.state && `, ${locationData.state}`}
                    </span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="shadow-medium mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder={t.searchSuppliers}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  variant={selectedType === null ? "default" : "outline"}
                  onClick={() => setSelectedType(null)}
                >
                  {t.all}
                </Button>
                <Button
                  variant={selectedType === "Seeds" ? "default" : "outline"}
                  onClick={() => setSelectedType("Seeds")}
                  className={selectedType === "Seeds" ? "bg-growth" : ""}
                >
                  <Sprout className="h-4 w-4 mr-2" />
                  {t.seeds}
                </Button>
                <Button
                  variant={selectedType === "Fertilizers" ? "default" : "outline"}
                  onClick={() => setSelectedType("Fertilizers")}
                  className={selectedType === "Fertilizers" ? "bg-harvest" : ""}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t.fertilizers}
                </Button>
                <Button
                  variant={selectedType === "Equipment" ? "default" : "outline"}
                  onClick={() => setSelectedType("Equipment")}
                  className={selectedType === "Equipment" ? "bg-primary" : ""}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {t.equipment}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        {loading && (
          <Card className="shadow-soft mb-6">
            <CardContent className="text-center py-12">
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-lg font-medium mb-2">Searching for suppliers...</p>
              <p className="text-muted-foreground">
                Finding agricultural suppliers in your area
              </p>
            </CardContent>
          </Card>
        )}
        
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(supplier.type)}`}>
                      {getTypeIcon(supplier.type)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{supplier.name}</CardTitle>
                      {supplier.verified && (
                        <Badge variant="outline" className="mt-1 border-growth text-growth">✓ {t.verified}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-harvest text-harvest" />
                  <span className="font-semibold">{supplier.rating}</span>
                  <span className="text-muted-foreground ml-1">{t.rating}</span>
                </CardDescription>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{supplier.location}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Distance and Location */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{supplier.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{supplier.address}</p>
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-sm font-semibold mb-2">{t.availableProducts}</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.products.map((product, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{t.price}:</span>
                      <span className="text-sm font-bold text-primary">{supplier.priceInfo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Price Range:</span>
                      <Badge className={getTypeColor(supplier.type)}>
                        {supplier.priceRange}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <a 
                        href={`tel:${supplier.phone}`}
                        className="text-sm text-primary hover:underline font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePhoneCall(supplier.phone);
                        }}
                      >
                        {supplier.phone}
                      </a>
                    </div>
                    {supplier.openingHours && (
                      <div className="text-xs text-muted-foreground">
                        {supplier.openingHours}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      className="flex-1 bg-gradient-primary"
                      onClick={() => handlePhoneCall(supplier.phone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t.contact}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => openGoogleMaps(supplier.lat, supplier.lng, supplier.name)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!hasSearched && (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Enter Pincode to Find Suppliers</p>
              <p className="text-muted-foreground">
                Please enter a 6-digit pincode above to find agricultural suppliers in your area
              </p>
            </CardContent>
          </Card>
        )}

        {hasSearched && filteredSuppliers.length === 0 && (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">{t.noSuppliersFound}</p>
              <p className="text-muted-foreground">
                {t.adjustSearch}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Chatbot/>
    </div>
  );
};

export default Suppliers;
