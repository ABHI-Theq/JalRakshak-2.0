"use client"
import { useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, MapPin, Users, Ruler, Bell, Building2, Calculator, TrendingUp, PieChart, BarChart3, CloudRain, Droplet, IndianRupee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { AnnualRainfallData, fetchAnnualRainfall } from "@/features";
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner";
import Link from "next/link";

type Inputs = {
  name: string;
  location: string;
  lat?: number;
  lon?: number;
  roofArea: number;
  dwellers: number;
  openSpace: number;
  annualRainfall?: number;
  roofType: 'concrete' | 'metal' | 'tile' | 'asphalt';
  waterPrice: number;
  discountRate: number;
  inflationRate: number;
};

type CostBreakdown = {
  materials: {
    tank: number;
    pipes: number;
    filters: number;
    pumps: number;
    accessories: number;
  };
  labor: {
    excavation: number;
    installation: number;
    plumbing: number;
    electrical: number;
  };
  maintenance: {
    annual: number;
    periodic: number;
    replacement: number;
  };
  total: number;
};

type FinancialAnalysis = {
  npv: number;
  irr: number;
  roi: number;
  paybackPeriod: number;
  breakEvenYear: number;
  totalSavings: number;
  netBenefit: number;
};

type RainAlert = {
  expected: boolean;
  mmNext24h: number;
  message?: string;
};

type RainfallAnalysis = {
  totalAnnual: number;
  monthly: number[];
  peakMonth: number;
  peakHarvest: number;
  storageEfficiency: number;
  effectiveHarvest: number;
}

const glass = "rounded-2xl bg-white/80 shadow-lg backdrop-blur-md border border-white/20 dark:border-white/10 dark:bg-white/10";
const gradientBg = "bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20";

// Safe calculation helpers
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === "" || isNaN(Number(value))) 
    return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : Math.max(0, num);
};

const safeArraySum = (arr: any[]): number => {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((sum, val) => sum + safeNumber(val), 0);
};

export default function Page() {
  const router = useRouter();
  const [inputs, setInputs] = useState<Inputs>({
    name: "",
    location: "",
    lat: undefined,
    lon: undefined,
    roofArea: 0,
    dwellers: 0,
    openSpace: 0,
    annualRainfall: undefined,
    roofType: 'concrete',
    waterPrice: 0,
    discountRate: 5,
    inflationRate: 3,
  });

  const [rainfallData, setRainfallData] = useState<AnnualRainfallData>()
  const [alert, setAlert] = useState<RainAlert>({ expected: false, mmNext24h: 0 });
  const [loadingAlert, setLoadingAlert] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [loadingfetch, setLoadingfetch] = useState<boolean>(false);
  const [hasValidInputs, setHasValidInputs] = useState(false);

  // Check if we have valid inputs for analysis
  useEffect(() => {
    const validRoofArea = safeNumber(inputs.roofArea) > 0;
    const validDwellers = safeNumber(inputs.dwellers) > 0;
    const validRainfall = safeNumber(inputs.annualRainfall) > 0;
    const validLocation = inputs.location.trim().length > 0;
    
    setHasValidInputs(validRoofArea && validDwellers && validRainfall && validLocation);
  }, [inputs.roofArea, inputs.dwellers, inputs.annualRainfall, inputs.location]);

  // Safe input values for calculations
  const safeInputs = useMemo(() => ({
    roofArea: safeNumber(inputs.roofArea),
    dwellers: safeNumber(inputs.dwellers),
    annualRainfall: safeNumber(inputs.annualRainfall, 0),
    waterPrice: safeNumber(inputs.waterPrice, 50),
    discountRate: safeNumber(inputs.discountRate, 5),
    inflationRate: safeNumber(inputs.inflationRate, 3),
    roofType: inputs.roofType || 'concrete',
    openSpace: safeNumber(inputs.openSpace)
  }), [inputs]);

  // Enhanced rainfall calculations with better validation
  const rainfallAnalysis = useMemo(() => {
    const baseRainfall = safeInputs.annualRainfall;
    const roofArea = safeInputs.roofArea;
    
    // Don't calculate if essential inputs are missing or zero
    if (roofArea <= 0 || baseRainfall <= 0) {
      return null;
    }

    // Runoff coefficients based on roof type
    const runoffCoefficients = {
      concrete: 0.85,
      metal: 0.90,
      tile: 0.80,
      asphalt: 0.75
    };

    const runoffCoeff = runoffCoefficients[safeInputs.roofType] || 0.85;

    // Seasonal distribution (typical for Indian climate)
    const seasonalDistribution = [0.05, 0.05, 0.10, 0.15, 0.20, 0.25, 0.15, 0.05];

    // Calculate monthly rainfall and harvest
    const monthlyRainfall = seasonalDistribution.map(factor => baseRainfall * factor);
    const monthlyHarvest = monthlyRainfall.map(rainfall =>
      Math.max(0, roofArea * (rainfall / 1000) * runoffCoeff * 1000) // Convert to liters
    );

    const totalAnnualHarvest = monthlyHarvest.reduce((sum, val) => sum + val, 0);

    // Peak month analysis
    const maxHarvest = Math.max(...monthlyHarvest);
    const peakMonth = monthlyHarvest.indexOf(maxHarvest);
    const peakHarvestValue = maxHarvest;

    // Storage efficiency factor
    const storageEfficiency = totalAnnualHarvest > 0 
      ? Math.min(0.95, 1 - (peakHarvestValue / totalAnnualHarvest) * 0.3)
      : 0;

    const result = {
      totalAnnual: Math.round(totalAnnualHarvest),
      monthly: monthlyHarvest.map(val => Math.round(val)),
      peakMonth: peakMonth + 1,
      peakHarvest: Math.round(peakHarvestValue),
      storageEfficiency: Math.round(storageEfficiency * 100) / 100,
      effectiveHarvest: Math.round(totalAnnualHarvest * storageEfficiency)
    };

    return result;
  }, [safeInputs.roofArea, safeInputs.annualRainfall, safeInputs.roofType]);

  // Enhanced storage optimization
  const storageOptimization = useMemo(() => {
    if (!rainfallAnalysis || rainfallAnalysis.effectiveHarvest <= 0 || safeInputs.dwellers <= 0) {
      return null;
    }
    
    const effectiveHarvest = rainfallAnalysis.effectiveHarvest;
    const volumeM3 = Math.max(1, Math.round(effectiveHarvest / 1000));

    // Optimal storage calculation based on demand patterns
    const dailyDemand = (safeInputs.dwellers * 150) / 1000; // 150L per person per day in m³
    const optimalStorageDays = Math.min(90, Math.max(30, effectiveHarvest / (dailyDemand * 365 * 1000)));
    const optimalVolumeM3 = Math.max(1, Math.round(dailyDemand * optimalStorageDays));

    // Structure recommendation based on volume and space
    let structureType = '';
    let dimensions = '';
    let complexity = 'Basic';

    if (optimalVolumeM3 <= 5) {
      structureType = 'RCC tank with first-flush and filter';
      const side = Math.ceil(Math.cbrt(optimalVolumeM3));
      dimensions = `${side}m x ${side}m x ${Math.ceil(optimalVolumeM3 / (side * side))}m`;
      complexity = 'Basic';
    } else if (optimalVolumeM3 <= 15) {
      structureType = 'RCC tank with recharge pit and silt trap';
      const side = Math.ceil(Math.sqrt(optimalVolumeM3 / 2.5));
      dimensions = `${side}m x ${side}m x 2.5m`;
      complexity = 'Intermediate';
    } else {
      structureType = 'Recharge pit + storage tank with advanced filtration';
      const side = Math.ceil(Math.sqrt(optimalVolumeM3 / 3));
      dimensions = `${side}m x ${side}m x 3m`;
      complexity = 'Advanced';
    }

    const result = {
      recommendedVolume: optimalVolumeM3,
      actualVolume: volumeM3,
      structureType,
      dimensions,
      complexity,
      storageDays: Math.round(optimalStorageDays),
      utilizationRate: optimalVolumeM3 > 0 ? Math.round((volumeM3 / optimalVolumeM3) * 100) / 100 : 0
    };

    return result;
  }, [rainfallAnalysis, safeInputs.dwellers]);

  // Enhanced cost breakdown
  const costBreakdown = useMemo((): CostBreakdown | null => {
    if (!storageOptimization || storageOptimization.recommendedVolume <= 0) {
      return null;
    }
    
    const volumeM3 = storageOptimization.recommendedVolume;
    const complexity = storageOptimization.complexity;

    // Base costs per m³ (in INR)
    const baseCosts = {
      materials: {
        tank: 2500,
        pipes: 150,
        filters: 8000,
        pumps: 12000,
        accessories: 5000
      },
      labor: {
        excavation: 300,
        installation: 800,
        plumbing: 200,
        electrical: 3000
      }
    };

    // Complexity multipliers
    const complexityMultipliers = {
      Basic: { materials: 1.0, labor: 1.0 },
      Intermediate: { materials: 1.2, labor: 1.3 },
      Advanced: { materials: 1.5, labor: 1.8 }
    };

    const multipliers = complexityMultipliers[complexity as keyof typeof complexityMultipliers] || complexityMultipliers.Basic;

    // Calculate pipe length
    const pipeLength = Math.max(20, Math.sqrt(safeInputs.roofArea) * 2 + 10);

    // Material costs
    const materials = {
      tank: Math.round(volumeM3 * baseCosts.materials.tank * multipliers.materials),
      pipes: Math.round(pipeLength * baseCosts.materials.pipes * multipliers.materials),
      filters: Math.round(baseCosts.materials.filters * multipliers.materials),
      pumps: Math.round(baseCosts.materials.pumps * multipliers.materials),
      accessories: Math.round(baseCosts.materials.accessories * multipliers.materials)
    };

    // Labor costs
    const labor = {
      excavation: Math.round(volumeM3 * baseCosts.labor.excavation * multipliers.labor),
      installation: Math.round(volumeM3 * baseCosts.labor.installation * multipliers.labor),
      plumbing: Math.round(pipeLength * baseCosts.labor.plumbing * multipliers.labor),
      electrical: Math.round(baseCosts.labor.electrical * multipliers.labor)
    };

    // Maintenance costs (annual)
    const maintenance = {
      annual: Math.round((materials.tank + materials.pumps) * 0.02),
      periodic: Math.round(volumeM3 * 50),
      replacement: Math.round((materials.filters + materials.accessories) * 0.1)
    };

    const totalMaterials = Object.values(materials).reduce((sum, cost) => sum + cost, 0);
    const totalLabor = Object.values(labor).reduce((sum, cost) => sum + cost, 0);
    const totalMaintenance = Object.values(maintenance).reduce((sum, cost) => sum + cost, 0);

    const result = {
      materials,
      labor,
      maintenance,
      total: totalMaterials + totalLabor
    };

    return result;
  }, [storageOptimization, safeInputs.roofArea]);

  // Enhanced financial analysis
  const financialAnalysis = useMemo((): FinancialAnalysis | null => {
    if (!rainfallAnalysis || !rainfallAnalysis.effectiveHarvest || !costBreakdown || costBreakdown.total <= 0) {
      return null;
    }
    
    const effectiveHarvest = rainfallAnalysis.effectiveHarvest;
    const annualWaterValue = (effectiveHarvest / 1000) * safeInputs.waterPrice;
    const initialCost = costBreakdown.total;
    const annualMaintenance = costBreakdown.maintenance.annual + costBreakdown.maintenance.periodic;

    // Project lifetime (years)
    const projectLifetime = 20;

    // Calculate annual cash flows
    const annualCashFlows = [];
    for (let year = 0; year <= projectLifetime; year++) {
      if (year === 0) {
        annualCashFlows.push(-initialCost);
      } else {
        const inflationAdjustedWaterValue = annualWaterValue * Math.pow(1 + safeInputs.inflationRate / 100, year - 1);
        const inflationAdjustedMaintenance = annualMaintenance * Math.pow(1 + safeInputs.inflationRate / 100, year - 1);
        annualCashFlows.push(inflationAdjustedWaterValue - inflationAdjustedMaintenance);
      }
    }

    // Calculate NPV
    const discountRate = safeInputs.discountRate / 100;
    const npv = annualCashFlows.reduce((sum, cashFlow, year) => {
      return sum + (cashFlow / Math.pow(1 + discountRate, year));
    }, 0);

    // Calculate IRR (simplified approximation)
    let irr = 0;
    const maxIterations = 100;
    const tolerance = 0.001;

    for (let i = 0; i < maxIterations; i++) {
      const testRate = i * 0.01;
      const testNPV = annualCashFlows.reduce((sum, cashFlow, year) => {
        return sum + (cashFlow / Math.pow(1 + testRate, year));
      }, 0);

      if (Math.abs(testNPV) < tolerance) {
        irr = testRate * 100;
        break;
      }
    }

    // Calculate ROI
    const totalBenefits = annualCashFlows.slice(1).reduce((sum, val) => sum + val, 0);
    const roi = initialCost > 0 ? ((totalBenefits - initialCost) / initialCost) * 100 : 0;

    // Calculate payback period
    let cumulativeCashFlow = 0;
    let paybackPeriod = projectLifetime;
    for (let year = 1; year <= projectLifetime; year++) {
      cumulativeCashFlow += annualCashFlows[year];
      if (cumulativeCashFlow >= initialCost) {
        paybackPeriod = year;
        break;
      }
    }

    // Calculate break-even year
    let breakEvenYear = projectLifetime;
    for (let year = 1; year <= projectLifetime; year++) {
      const cumulativeNPV = annualCashFlows.slice(0, year + 1).reduce((sum, cashFlow, y) => {
        return sum + (cashFlow / Math.pow(1 + discountRate, y));
      }, 0);
      if (cumulativeNPV >= 0) {
        breakEvenYear = year;
        break;
      }
    }

    const result = {
      npv: Math.round(npv),
      irr: Math.round(irr * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      paybackPeriod,
      breakEvenYear,
      totalSavings: Math.round(totalBenefits),
      netBenefit: Math.round(totalBenefits - initialCost)
    };

    return result;
  }, [rainfallAnalysis, safeInputs.waterPrice, safeInputs.discountRate, safeInputs.inflationRate, costBreakdown]);

  // Enhanced sensitivity analysis
  const sensitivityAnalysis = useMemo(() => {
    if (!financialAnalysis || !rainfallAnalysis || !costBreakdown) {
      return null;
    }
    
    const baseNPV = financialAnalysis.npv;

    // Test sensitivity to key variables (±20% variation)
    const variations = [-20, -10, 0, 10, 20];

    const rainfallSensitivity = variations.map(variation => {
      const adjustedRainfall = safeInputs.annualRainfall * (1 + variation / 100);
      const adjustedHarvest = rainfallAnalysis.effectiveHarvest * (1 + variation / 100);
      const adjustedWaterValue = (adjustedHarvest / 1000) * safeInputs.waterPrice;
      const adjustedNPV = adjustedWaterValue * 15 - costBreakdown.total;
      
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: baseNPV !== 0 ? Math.round(((adjustedNPV - baseNPV) / Math.abs(baseNPV)) * 100) : 0
      };
    });

    const costSensitivity = variations.map(variation => {
      const adjustedCost = costBreakdown.total * (1 + variation / 100);
      const adjustedNPV = (rainfallAnalysis.effectiveHarvest / 1000) * safeInputs.waterPrice * 15 - adjustedCost;
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: baseNPV !== 0 ? Math.round(((adjustedNPV - baseNPV) / Math.abs(baseNPV)) * 100) : 0
      };
    });

    const waterPriceSensitivity = variations.map(variation => {
      const adjustedWaterPrice = safeInputs.waterPrice * (1 + variation / 100);
      const adjustedWaterValue = (rainfallAnalysis.effectiveHarvest / 1000) * adjustedWaterPrice;
      const adjustedNPV = adjustedWaterValue * 15 - costBreakdown.total;
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: baseNPV !== 0 ? Math.round(((adjustedNPV - baseNPV) / Math.abs(baseNPV)) * 100) : 0
      };
    });

    const result = {
      rainfall: rainfallSensitivity,
      cost: costSensitivity,
      waterPrice: waterPriceSensitivity
    };

    return result;
  }, [financialAnalysis, rainfallAnalysis, safeInputs.annualRainfall, safeInputs.waterPrice, costBreakdown]);

  // Count how many analysis components we have
  const analysisCount = [
    rainfallAnalysis,
    storageOptimization,
    costBreakdown,
    financialAnalysis,
    sensitivityAnalysis
  ].filter(Boolean).length;

  // Determine layout based on analysis count
  const formColSpan = analysisCount === 0 ? "lg:col-span-3" : "lg:col-span-1";
  const resultsColSpan = analysisCount === 0 ? "lg:col-span-0" : "lg:col-span-2";

  async function geolocate() {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setInputs((s) => ({ ...s, lat: latitude, lon: longitude, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        await fetchAlert(latitude, longitude);
        setGeoBusy(false);
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function geocodeAndFetch() {
    try {
      setLoadingfetch(true)
      if (!inputs.location?.trim()) return;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputs.location)}`;
      const res = await fetch(url);
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setInputs((s) => ({ ...s, lat, lon }));
        await fetchAlert(lat, lon);
        await onLocationEnter(lat,lon);
      }
    } catch (e) {
      toast.error("Failed to fetch location data");
    } finally {
      setLoadingfetch(false)
    }
  }

  async function fetchAlert(lat?: number, lon?: number) {
    if (lat == null || lon == null) return;
    setLoadingAlert(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&forecast_days=2&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const pr: number[] = data?.hourly?.precipitation ?? [];
      const mmNext24h = pr.slice(0, 24).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      const expected = mmNext24h >= 1;
      setAlert({ expected, mmNext24h, message: expected ? "Rain expected in next 24 hours! Prepare your rooftop system." : undefined });
    } catch (e) {
      setAlert({ expected: false, mmNext24h: 0 });
    } finally {
      setLoadingAlert(false);
    }
  }

  useEffect(() => {
    if (inputs.lat && inputs.lon) fetchAlert(inputs.lat, inputs.lon);
  }, []);

  const onLocationEnter = async (lat:number,lon:number) => {
    if (lat && lon && inputs.location) {
     try {
       const result = await fetchAnnualRainfall(lat, lon, inputs.location);
       if(result?.error){
        toast.error(result.error)
       }
       setInputs((s) => ({
         ...s,
         annualRainfall: result.annualRainfall,
       }));
       setRainfallData(result)
     } catch (error) {
      toast.error("Failed to Fetch the data")
     }
    }
  }

  // Fix the annual rainfall display in the form
  const displayAnnualRainfall = inputs.annualRainfall !== undefined && inputs.annualRainfall !== 0 
    ? inputs.annualRainfall 
    : rainfallData?.annualRainfall 
    ? rainfallData.annualRainfall 
    : "Set location to fetch";

  return (
    <main className={`min-h-screen ${gradientBg} relative overflow-hidden`}>
      {/* Background decorative elements */}
      {/* <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
       */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/20">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="h-8 w-8 text-[#0F4b6d]" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0F2D46] to-[#123458] bg-clip-text text-transparent">
                Rainwater Harvesting Analysis
              </h1>
              <p className="text-sm text-gray-600 mt-1">Smart water management for sustainable living</p>
            </div>
          </div>
        </motion.div>

        {/* Rain Alert */}
        <AnimatePresence>
          {alert.expected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${glass} mb-10 flex items-center gap-3 px-4 py-3 border-l-4 border-[#0F4b6d]`}
            >
              <Bell className="h-5 w-5 text-[#0F4b6d] animate-pulse" />
              <p className="text-sm text-[#0F2d46]/90">
                🌧 Rain expected in next 24 hours (~{alert.mmNext24h.toFixed(1)} mm). Prepare your rooftop harvesting system.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form Section - Dynamic positioning */}
          <motion.section 
            layout
            className={`${formColSpan} p-6 ${glass} transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gauge className="h-6 w-6 text-[#0F4b6d]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0f2d46]">Project Details</h2>
                <p className="text-sm text-[#0f2d46]">Enter your property information</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); fetchAlert(inputs.lat, inputs.lon); }}>
              <Field label="Name">
                <input
                  value={inputs.name}
                  onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white/60 px-4 text-sm text-[#0f2d46] placeholder-gray-500 outline-none transition-all focus:border-[#123458] focus:bg-white "
                  placeholder="Your name"
                />
              </Field>

              <Field label="Location">
                <div className="flex items-stretch gap-2">
                  <input
                    value={inputs.location}
                    onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                    className="flex-1 h-10 rounded-xl border border-gray-200 bg-white/60 px-4 text-sm text-[#0f2d46] placeholder-gray-500 outline-none transition-all focus:border-[#123458] focus:bg-white"
                    placeholder="City or address"
                  />
                  <Button type="button" onClick={geocodeAndFetch} disabled={!inputs.location || loadingfetch} className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-[#0f4b6d] to-[#0f2d46] px-4 text-white hover:bg-[#0f2d46] transition-all">
                    <MapPin className="mr-2 h-4 w-4" /> {loadingfetch ? '...' : "Set"}
                  </Button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Roof area (m²)">
                  <NumberInput value={inputs.roofArea} onChange={(n) => setInputs({ ...inputs, roofArea: n })} />
                </Field>
                <Field label="Dwellers">
                  <NumberInput value={inputs.dwellers} onChange={(n) => setInputs({ ...inputs, dwellers: n })} />
                </Field>
              </div>

              <Field label="Available space (m²)">
                <NumberInput value={inputs.openSpace} onChange={(n) => setInputs({ ...inputs, openSpace: n })} />
              </Field>

              <Field label="Annual rainfall (mm)">
                <div className="relative w-full bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200 text-center font-semibold text-[#123458]">
                  {displayAnnualRainfall}
                  <CloudRain className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0f4b6d]" />
                </div>
              </Field>

              <Field label="Roof Type">
                <select
                  value={inputs.roofType}
                  onChange={(e) => setInputs({ ...inputs, roofType: e.target.value as any })}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white/60 px-4 text-sm text-[#0f2d46] outline-none transition-all focus:border-[#123458] focus:bg-white"
                >
                  <option value="concrete">Concrete</option>
                  <option value="metal">Metal</option>
                  <option value="tile">Tile</option>
                  <option value="asphalt">Asphalt</option>
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Water Price (₹/1000L)">
                  <NumberInput value={inputs.waterPrice} onChange={(n) => setInputs({ ...inputs, waterPrice: n })} />
                </Field>
                <Field label="Discount Rate (%)">
                  <NumberInput value={inputs.discountRate} onChange={(n) => setInputs({ ...inputs, discountRate: n })} />
                </Field>
              </div>

              <Field label="Inflation Rate (%)">
                <NumberInput value={inputs.inflationRate} onChange={(n) => setInputs({ ...inputs, inflationRate: n })} />
              </Field>
{/* 
              <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02] shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Analyze Feasibility
              </Button> */}
            </form>
          </motion.section>

          {/* Results Section - Dynamic sizing */}
          <AnimatePresence>
            {analysisCount > 0 && (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${resultsColSpan} grid grid-cols-1 gap-6 max-h-[100vh] overflow-y-auto p-4`}
              >
                {/* Welcome State */}
                {!hasValidInputs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center h-64"
                  >
                    <div className="text-center">
                      <Droplet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600">Complete the form to see analysis</h3>
                      <p className="text-gray-500 mt-2">Fill in all required fields to generate your rainwater harvesting report</p>
                    </div>
                  </motion.div>
                )}

                {/* Rainfall Analysis */}
                <AnimatePresence>
                  {rainfallAnalysis && (
                    <AnalysisCard
                      icon={<CloudRain className="h-5 w-5" />}
                      title="Rainfall Analysis"
                      color="blue"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Metric value={rainfallAnalysis.effectiveHarvest.toLocaleString()} label="L/year (Effective)" color="blue" />
                          <Metric value={`${(rainfallAnalysis.storageEfficiency * 100).toFixed(1)}%`} label="Storage Efficiency" color="green" />
                          <Metric value={`Month ${rainfallAnalysis.peakMonth}`} label="Peak Harvest" color="purple" />
                          <Metric value={rainfallAnalysis.peakHarvest.toLocaleString()} label="Peak Volume (L)" color="orange" />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Distribution</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {rainfallAnalysis.monthly.map((volume, index) => (
                              <div key={index} className="text-center">
                                <div className="bg-blue-100 rounded-lg p-2 mb-1">
                                  <div
                                    className="bg-gradient-to-t from-blue-500 to-cyan-500 rounded transition-all duration-500"
                                    style={{ height: `${Math.max(20, (volume / Math.max(...rainfallAnalysis.monthly)) * 60)}px` }}
                                  />
                                </div>
                                <p className="text-xs font-medium text-gray-600">{volume.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">M{index + 1}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AnalysisCard>
                  )}
                </AnimatePresence>

                {/* Storage Optimization */}
                <AnimatePresence>
                  {storageOptimization && storageOptimization.recommendedVolume > 0 && (
                    <AnalysisCard
                      icon={<Building2 className="h-5 w-5" />}
                      title="Storage Optimization"
                      color="green"
                    >
                      <div className="flex items-center justify-center  md:grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Recommended Structure</h4>
                          <p className="text-sm text-gray-600 mb-2">{storageOptimization.structureType}</p>
                          <p className="text-sm text-gray-600 mb-2">Dimensions: {storageOptimization.dimensions}</p>
                          <Badge variant={storageOptimization.complexity === 'Basic' ? 'default' : storageOptimization.complexity === 'Intermediate' ? 'secondary' : 'destructive'}>
                            {storageOptimization.complexity}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Storage Analysis</h4>
                          <div className=" flex items-center justify-center gap-5 ">
                            <Metric value={`${storageOptimization.recommendedVolume} m³`} label="Volume" color="blue" small />
                            <Metric value={`${storageOptimization.storageDays} days`} label="Storage Days" color="green" small />
                            <Metric value={`${(storageOptimization.utilizationRate * 100).toFixed(1)}%`} label="Utilization" color="purple" small />
                          </div>
                        </div>
                        <div className="w-full  mx-auto">
                        <Button className="bg-[#0f2d46] text-[#fff6ee] hover:bg-[#123458]">
                          <Link href={`/structure?structure=${encodeURIComponent(storageOptimization.structureType)}&dimensions=${encodeURIComponent(storageOptimization.dimensions)}&volume=${encodeURIComponent(storageOptimization.recommendedVolume)}&complexity=${encodeURIComponent(storageOptimization.complexity)}`}>Visit the recommeded structure details</Link>
                        </Button>
                        </div>
                      </div>
                    </AnalysisCard>
                  )}
                </AnimatePresence>

                {/* Cost Breakdown */}
                <AnimatePresence>
                  {costBreakdown && costBreakdown.total > 0 && (
                    <AnalysisCard
                      icon={<Calculator className="h-5 w-5" />}
                      title="Cost Breakdown"
                      color="orange"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Materials</h4>
                          <div className="space-y-2">
                            <CostItem label="Tank" value={costBreakdown.materials.tank} />
                            <CostItem label="Pipes" value={costBreakdown.materials.pipes} />
                            <CostItem label="Filters" value={costBreakdown.materials.filters} />
                            <CostItem label="Pumps" value={costBreakdown.materials.pumps} />
                            <CostItem label="Accessories" value={costBreakdown.materials.accessories} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Labor</h4>
                          <div className="space-y-2">
                            <CostItem label="Excavation" value={costBreakdown.labor.excavation} />
                            <CostItem label="Installation" value={costBreakdown.labor.installation} />
                            <CostItem label="Plumbing" value={costBreakdown.labor.plumbing} />
                            <CostItem label="Electrical" value={costBreakdown.labor.electrical} />
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-700">Total Installation Cost</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            ₹{costBreakdown.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </AnalysisCard>
                  )}
                </AnimatePresence>

                {/* Financial Analysis */}
                <AnimatePresence>
                  {financialAnalysis && (
                    <AnalysisCard
                      icon={<TrendingUp className="h-5 w-5" />}
                      title="Financial Analysis"
                      color="purple"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Metric value={`₹${financialAnalysis.npv.toLocaleString()}`} label="Net Present Value" color="blue" />
                        <Metric value={`${financialAnalysis.irr}%`} label="Internal Rate of Return" color="green" />
                        <Metric value={`${financialAnalysis.roi}%`} label="Return on Investment" color="purple" />
                        <Metric value={`${financialAnalysis.paybackPeriod} years`} label="Payback Period" color="orange" />
                        <Metric value={`Year ${financialAnalysis.breakEvenYear}`} label="Break-even Year" color="teal" />
                        <Metric value={`₹${financialAnalysis.netBenefit.toLocaleString()}`} label="Net Benefit" color="indigo" />
                      </div>
                    </AnalysisCard>
                  )}
                </AnimatePresence>

                {/* Sensitivity Analysis */}
                <AnimatePresence>
                  {sensitivityAnalysis && (
                    <AnalysisCard
                      icon={<BarChart3 className="h-5 w-5" />}
                      title="Sensitivity Analysis"
                      color="red"
                    >
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <SensitivitySection title="Rainfall Impact" data={sensitivityAnalysis.rainfall} />
                          <SensitivitySection title="Cost Impact" data={sensitivityAnalysis.cost} />
                          <SensitivitySection title="Water Price Impact" data={sensitivityAnalysis.waterPrice} />
                        </div>
                      </div>
                    </AnalysisCard>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// Reusable Components
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 inline-block text-sm font-medium text-[#123458]">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      value={value === 0 ? "" : value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? 0 : Number(val));
      }}
      className="w-full h-10 rounded-xl border border-gray-200 bg-white/60 px-4 text-sm text-[#0f2d46] placeholder-gray-500 outline-none transition-all focus:border-[#123458] focus:bg-white"
    />
  );
}

function AnalysisCard({ 
  icon, 
  title, 
  color = "blue", 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  color?: "blue" | "green" | "orange" | "purple" | "red";
  children: React.ReactNode;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-amber-500",
    purple: "from-purple-500 to-violet-500",
    red: "from-red-500 to-pink-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${glass} transition-all duration-300 hover:shadow-xl py-3 px-2`}
    >
      <CardHeader className="">
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
            {icon}
          </div>
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </motion.div>
  );
}

function Metric({ value, label, color = "blue", small = false }: { value: string; label: string; color?: string; small?: boolean }) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600"
  };

  return (
    <div className="text-center">
      <p className={`${small ? "text-lg" : "text-2xl"} font-bold ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
        {value}
      </p>
      <p className={`${small ? "text-xs" : "text-sm"} text-gray-600 mt-1`}>{label}</p>
    </div>
  );
}

function CostItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-800">₹{value.toLocaleString()}</span>
    </div>
  );
}

function SensitivitySection({ title, data }: { title: string; data: any[] }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-3 text-sm">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-gray-600">
              {item.variation > 0 ? '+' : ''}{item.variation}%
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">₹{item.npv.toLocaleString()}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.change > 0 ? 'bg-green-100 text-green-800' :
                item.change < 0 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.change > 0 ? '+' : ''}{item.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}