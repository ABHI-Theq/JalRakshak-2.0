"use client"
import { useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, MapPin, Users, Ruler, Bell, Building2, Calculator, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type Inputs = {
  name: string;
  location: string;
  lat?: number;
  lon?: number;
  roofArea: number; // m^2
  dwellers: number;
  openSpace: number; // m^2
  annualRainfall?: number; // mm, optional override
  roofType: 'concrete' | 'metal' | 'tile' | 'asphalt';
  waterPrice: number; // per 1000L in local currency
  discountRate: number; // annual discount rate for NPV calculation
  inflationRate: number; // annual inflation rate
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

const glass =
  "rounded-2xl border border-black bg-white/20 shadow-xl ring-1 ring-black/20 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:ring-white/10";

export default function Page() {
  const router = useRouter();
  const [inputs, setInputs] = useState<Inputs>({
    name: "Resident",
    location: "New Delhi, IN",
    lat: undefined,
    lon: undefined,
    roofArea: 0,
    dwellers: 0,
    openSpace: 0,
    annualRainfall: 0,
    roofType: 'concrete',
    waterPrice: 30,
    discountRate: 8,
    inflationRate: 4,
  });
  const [alert, setAlert] = useState<RainAlert>({ expected: false, mmNext24h: 0 });
  const [loadingAlert, setLoadingAlert] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);

  // Advanced rainfall calculations with seasonal variations and climate factors
  const rainfallAnalysis = useMemo(() => {
    const baseRainfall = inputs.annualRainfall ?? 800;
    const roofArea = inputs.roofArea;
    
    // Runoff coefficients based on roof type
    const runoffCoefficients = {
      concrete: 0.85,
      metal: 0.90,
      tile: 0.80,
      asphalt: 0.75
    };
    
    const runoffCoeff = runoffCoefficients[inputs.roofType];
    
    // Seasonal distribution (typical for Indian climate)
    const seasonalDistribution = [0.05, 0.05, 0.10, 0.15, 0.20, 0.25, 0.15, 0.05]; // Jan to Aug
    
    // Calculate monthly rainfall
    const monthlyRainfall = seasonalDistribution.map(factor => baseRainfall * factor);
    
    // Calculate monthly harvest potential
    const monthlyHarvest = monthlyRainfall.map(rainfall => 
      Math.max(0, roofArea * rainfall * runoffCoeff)
    );
    
    const totalAnnualHarvest = monthlyHarvest.reduce((sum, val) => sum + val, 0);
    
    // Peak month analysis
    const peakMonth = monthlyHarvest.indexOf(Math.max(...monthlyHarvest));
    const peakHarvest = monthlyHarvest[peakMonth];
    
    // Storage efficiency factor (accounts for overflow during peak months)
    const storageEfficiency = Math.min(0.95, 1 - (peakHarvest / totalAnnualHarvest) * 0.3);
    
    return {
      totalAnnual: Math.round(totalAnnualHarvest),
      monthly: monthlyHarvest.map(val => Math.round(val)),
      peakMonth: peakMonth + 1, // Convert to 1-based month
      peakHarvest: Math.round(peakHarvest),
      storageEfficiency: Math.round(storageEfficiency * 100) / 100,
      effectiveHarvest: Math.round(totalAnnualHarvest * storageEfficiency)
    };
  }, [inputs.roofArea, inputs.annualRainfall, inputs.roofType]);

  // Advanced storage optimization
  const storageOptimization = useMemo(() => {
    const effectiveHarvest = rainfallAnalysis.effectiveHarvest;
    const volumeM3 = Math.max(1, Math.round(effectiveHarvest / 1000));
    
    // Optimal storage calculation based on demand patterns
    const dailyDemand = (inputs.dwellers * 150) / 365; // 150L per person per day
    const optimalStorageDays = Math.min(90, Math.max(30, effectiveHarvest / (dailyDemand * 365)));
    const optimalVolumeM3 = Math.round((dailyDemand * optimalStorageDays) / 1000);
    
    // Structure recommendation based on volume and space
    let structureType = '';
    let dimensions = '';
    let complexity = 'Basic';
    
    if (optimalVolumeM3 <= 5) {
      structureType = 'RCC tank with first-flush and filter';
      dimensions = `${Math.ceil(Math.cbrt(optimalVolumeM3 * 1000))}m x ${Math.ceil(Math.cbrt(optimalVolumeM3 * 1000))}m x 2m`;
      complexity = 'Basic';
    } else if (optimalVolumeM3 <= 15) {
      structureType = 'RCC tank with recharge pit and silt trap';
      dimensions = `${Math.ceil(Math.sqrt(optimalVolumeM3))}m x ${Math.ceil(Math.sqrt(optimalVolumeM3))}m x 2.5m`;
      complexity = 'Intermediate';
    } else {
      structureType = 'Recharge pit + storage tank with advanced filtration';
      dimensions = `${Math.ceil(Math.sqrt(optimalVolumeM3 * 0.6))}m x ${Math.ceil(Math.sqrt(optimalVolumeM3 * 0.6))}m x 3m`;
      complexity = 'Advanced';
    }
    
    return {
      recommendedVolume: optimalVolumeM3,
      actualVolume: volumeM3,
      structureType,
      dimensions,
      complexity,
      storageDays: Math.round(optimalStorageDays),
      utilizationRate: Math.round((optimalVolumeM3 / Math.max(volumeM3, 1)) * 100) / 100
    };
  }, [rainfallAnalysis.effectiveHarvest, inputs.dwellers]);

  // Comprehensive cost breakdown with regional pricing
  const costBreakdown = useMemo((): CostBreakdown => {
    const volumeM3 = storageOptimization.recommendedVolume;
    const complexity = storageOptimization.complexity;
    
    // Regional cost multipliers (Delhi as base = 1.0)
    const regionalMultiplier = 1.0; // Can be enhanced with location-based pricing
    
    // Base costs per m³ (in INR)
    const baseCosts = {
      materials: {
        tank: 2500, // per m³
        pipes: 150, // per m
        filters: 8000, // fixed
        pumps: 12000, // fixed
        accessories: 5000 // fixed
      },
      labor: {
        excavation: 300, // per m³
        installation: 800, // per m³
        plumbing: 200, // per m
        electrical: 3000 // fixed
      }
    };
    
    // Complexity multipliers
    const complexityMultipliers = {
      Basic: { materials: 1.0, labor: 1.0 },
      Intermediate: { materials: 1.2, labor: 1.3 },
      Advanced: { materials: 1.5, labor: 1.8 }
    };
    
    const multipliers = complexityMultipliers[complexity as keyof typeof complexityMultipliers];
    
    // Calculate pipe length (estimated based on roof area and distance)
    const pipeLength = Math.max(20, Math.sqrt(inputs.roofArea) * 2 + 10);
    
    // Material costs
    const materials = {
      tank: Math.round(volumeM3 * baseCosts.materials.tank * multipliers.materials * regionalMultiplier),
      pipes: Math.round(pipeLength * baseCosts.materials.pipes * multipliers.materials * regionalMultiplier),
      filters: Math.round(baseCosts.materials.filters * multipliers.materials * regionalMultiplier),
      pumps: Math.round(baseCosts.materials.pumps * multipliers.materials * regionalMultiplier),
      accessories: Math.round(baseCosts.materials.accessories * multipliers.materials * regionalMultiplier)
    };
    
    // Labor costs
    const labor = {
      excavation: Math.round(volumeM3 * baseCosts.labor.excavation * multipliers.labor * regionalMultiplier),
      installation: Math.round(volumeM3 * baseCosts.labor.installation * multipliers.labor * regionalMultiplier),
      plumbing: Math.round(pipeLength * baseCosts.labor.plumbing * multipliers.labor * regionalMultiplier),
      electrical: Math.round(baseCosts.labor.electrical * multipliers.labor * regionalMultiplier)
    };
    
    // Maintenance costs (annual)
    const maintenance = {
      annual: Math.round((materials.tank + materials.pumps) * 0.02), // 2% of major equipment
      periodic: Math.round(volumeM3 * 50), // Periodic cleaning and maintenance
      replacement: Math.round((materials.filters + materials.accessories) * 0.1) // 10% replacement fund
    };
    
    const totalMaterials = Object.values(materials).reduce((sum, cost) => sum + cost, 0);
    const totalLabor = Object.values(labor).reduce((sum, cost) => sum + cost, 0);
    const totalMaintenance = Object.values(maintenance).reduce((sum, cost) => sum + cost, 0);
    
    return {
      materials,
      labor,
      maintenance,
      total: totalMaterials + totalLabor
    };
  }, [storageOptimization, inputs.roofArea]);

  // Advanced financial analysis with NPV, IRR, and ROI calculations
  const financialAnalysis = useMemo((): FinancialAnalysis => {
    const effectiveHarvest = rainfallAnalysis.effectiveHarvest;
    const annualWaterValue = (effectiveHarvest / 1000) * inputs.waterPrice;
    const initialCost = costBreakdown.total;
    const annualMaintenance = costBreakdown.maintenance.annual + costBreakdown.maintenance.periodic;
    
    // Project lifetime (years)
    const projectLifetime = 20;
    
    // Calculate annual cash flows
    const annualCashFlows = [];
    for (let year = 0; year <= projectLifetime; year++) {
      if (year === 0) {
        // Initial investment (negative cash flow)
        annualCashFlows.push(-initialCost);
      } else {
        // Annual benefits minus maintenance (with inflation adjustment)
        const inflationAdjustedWaterValue = annualWaterValue * Math.pow(1 + inputs.inflationRate / 100, year - 1);
        const inflationAdjustedMaintenance = annualMaintenance * Math.pow(1 + inputs.inflationRate / 100, year - 1);
        annualCashFlows.push(inflationAdjustedWaterValue - inflationAdjustedMaintenance);
      }
    }
    
    // Calculate NPV
    const discountRate = inputs.discountRate / 100;
    const npv = annualCashFlows.reduce((sum, cashFlow, year) => {
      return sum + (cashFlow / Math.pow(1 + discountRate, year));
    }, 0);
    
    // Calculate IRR (simplified approximation)
    let irr = 0;
    const maxIterations = 100;
    const tolerance = 0.001;
    
    for (let i = 0; i < maxIterations; i++) {
      const testRate = i * 0.01; // Test rates from 0% to 100%
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
    const roi = ((totalBenefits - initialCost) / initialCost) * 100;
    
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
    
    return {
      npv: Math.round(npv),
      irr: Math.round(irr * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      paybackPeriod,
      breakEvenYear,
      totalSavings: Math.round(totalBenefits),
      netBenefit: Math.round(totalBenefits - initialCost)
    };
  }, [rainfallAnalysis.effectiveHarvest, inputs.waterPrice, inputs.discountRate, inputs.inflationRate, costBreakdown]);

  // Sensitivity Analysis
  const sensitivityAnalysis = useMemo(() => {
    const baseNPV = financialAnalysis.npv;
    const baseIRR = financialAnalysis.irr;
    const basePayback = financialAnalysis.paybackPeriod;
    
    // Test sensitivity to key variables (±20% variation)
    const variations = [-20, -10, 0, 10, 20];
    
    const rainfallSensitivity = variations.map(variation => {
      const adjustedRainfall = (inputs.annualRainfall ?? 800) * (1 + variation / 100);
      const adjustedHarvest = rainfallAnalysis.effectiveHarvest * (1 + variation / 100);
      const adjustedWaterValue = (adjustedHarvest / 1000) * inputs.waterPrice;
      
      // Simplified NPV calculation for sensitivity
      const adjustedNPV = adjustedWaterValue * 15 - costBreakdown.total; // 15 years of benefits
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: Math.round(((adjustedNPV - baseNPV) / Math.max(Math.abs(baseNPV), 1)) * 100)
      };
    });
    
    const costSensitivity = variations.map(variation => {
      const adjustedCost = costBreakdown.total * (1 + variation / 100);
      const adjustedNPV = (rainfallAnalysis.effectiveHarvest / 1000) * inputs.waterPrice * 15 - adjustedCost;
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: Math.round(((adjustedNPV - baseNPV) / Math.max(Math.abs(baseNPV), 1)) * 100)
      };
    });
    
    const waterPriceSensitivity = variations.map(variation => {
      const adjustedWaterPrice = inputs.waterPrice * (1 + variation / 100);
      const adjustedWaterValue = (rainfallAnalysis.effectiveHarvest / 1000) * adjustedWaterPrice;
      const adjustedNPV = adjustedWaterValue * 15 - costBreakdown.total;
      return {
        variation,
        npv: Math.round(adjustedNPV),
        change: Math.round(((adjustedNPV - baseNPV) / Math.max(Math.abs(baseNPV), 1)) * 100)
      };
    });
    
    return {
      rainfall: rainfallSensitivity,
      cost: costSensitivity,
      waterPrice: waterPriceSensitivity
    };
  }, [financialAnalysis, rainfallAnalysis.effectiveHarvest, inputs.annualRainfall, inputs.waterPrice, costBreakdown]);

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
      if (!inputs.location?.trim()) return;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputs.location)}`;
      const res = await fetch(url);
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setInputs((s) => ({ ...s, lat, lon }));
        await fetchAlert(lat, lon);
      }
    } catch (e) {}
  }

  async function fetchAlert(lat?: number, lon?: number) {
    if (lat == null || lon == null) return;
    setLoadingAlert(true);
    try {
      // Using Open-Meteo (no key) to simulate a 24h rain alert
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&forecast_days=2&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const pr: number[] = data?.hourly?.precipitation ?? [];
      const mmNext24h = pr.slice(0, 24).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      const expected = mmNext24h >= 1; // threshold 1 mm
      setAlert({ expected, mmNext24h, message: expected ? "Rain expected in next 24 hours! Prepare your rooftop system." : undefined });
    } catch (e) {
      setAlert({ expected: false, mmNext24h: 0 });
    } finally {
      setLoadingAlert(false);
    }
  }

  useEffect(() => {
    if (inputs.lat && inputs.lon) fetchAlert(inputs.lat, inputs.lon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Local top nav (reuses global navbar overall, this section adds sticky summary) */}
      <div className="mb-6 flex items-center justify-between text-black dark:text-blue-100">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          <span className="text-xl font-bold">Analysis</span>
        </div>
        <div className="text-xs text-black/70 dark:text-blue-100/70">Rainwater Harvesting Feasibility</div>
      </div>

      {alert.expected && (
        <div className={`${glass} mb-6 flex items-center gap-3 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <p className="text-sm text-blue-900/90 dark:text-blue-100/90">
            🌧 Rain expected in next 24 hours (~{alert.mmNext24h.toFixed(1)} mm). Prepare your rooftop harvesting system.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <section className={`lg:col-span-1 p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-black dark:text-blue-100">
            <Gauge className="h-5 w-5" /> Input Details
          </h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); fetchAlert(inputs.lat, inputs.lon); }}>
            <Field label="Name">
              <input
                value={inputs.name}
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                className="w-full h-10 rounded-lg border border-black bg-white/40 px-3 text-sm text-black placeholder-black/50 outline-none ring-1 ring-black/20 backdrop-blur focus:border-black focus:ring-black/30 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
                placeholder="Your name"
              />
            </Field>
            <Field label="Location">
              <div className="flex items-stretch gap-2">
                <input
                  value={inputs.location}
                  onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                  className="flex-1 h-10 rounded-lg border border-white/30 bg-white/40 px-3 text-sm text-blue-900 placeholder-blue-900/50 outline-none ring-1 ring-white/40 backdrop-blur focus:border-blue-300 focus:ring-blue-200 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
                  placeholder="City or address"
                />
                <Button type="button" onClick={geocodeAndFetch} className="h-10 shrink-0 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700">
                  <MapPin className="mr-2 h-4 w-4" /> Set
                </Button>
              </div>
            </Field>
            <Field label="Roof area (m²)">
              <NumberInput value={inputs.roofArea} onChange={(n) => setInputs({ ...inputs, roofArea: n })} />
            </Field>
            <Field label="Number of dwellers">
              <NumberInput value={inputs.dwellers} onChange={(n) => setInputs({ ...inputs, dwellers: n })} />
            </Field>
            <Field label="Available open space (m²)">
              <NumberInput value={inputs.openSpace} onChange={(n) => setInputs({ ...inputs, openSpace: n })} />
            </Field>
            <Field label="Annual rainfall (mm)">
              <NumberInput value={inputs.annualRainfall ?? 800} onChange={(n) => setInputs({ ...inputs, annualRainfall: n })} />
            </Field>
            <Field label="Roof Type">
              <select
                value={inputs.roofType}
                onChange={(e) => setInputs({ ...inputs, roofType: e.target.value as any })}
                className="w-full h-10 rounded-lg border border-black bg-white/40 px-3 text-sm text-black outline-none ring-1 ring-black/20 backdrop-blur focus:border-black focus:ring-black/30 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
              >
                <option value="concrete">Concrete</option>
                <option value="metal">Metal</option>
                <option value="tile">Tile</option>
                <option value="asphalt">Asphalt</option>
              </select>
            </Field>
            <Field label="Water Price (₹/1000L)">
              <NumberInput value={inputs.waterPrice} onChange={(n) => setInputs({ ...inputs, waterPrice: n })} />
            </Field>
            <Field label="Discount Rate (%)">
              <NumberInput value={inputs.discountRate} onChange={(n) => setInputs({ ...inputs, discountRate: n })} />
            </Field>
            <Field label="Inflation Rate (%)">
              <NumberInput value={inputs.inflationRate} onChange={(n) => setInputs({ ...inputs, inflationRate: n })} />
            </Field>
          </form>
        </section>

        {/* Results */}
        <section className="lg:col-span-2 grid grid-cols-1 gap-6">
          {/* Rainfall Analysis */}
          <Card className="bg-white/20 backdrop-blur-md border-black/20 dark:border-white/10 dark:bg-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Droplets className="h-5 w-5" />
                Advanced Rainfall Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {!Number.isNaN(rainfallAnalysis.effectiveHarvest) && rainfallAnalysis.effectiveHarvest.toLocaleString()}
                    {Number.isNaN(rainfallAnalysis.effectiveHarvest) && "0"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">L/year (Effective)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {!Number.isNaN(rainfallAnalysis.storageEfficiency) && rainfallAnalysis.storageEfficiency * 100}%
                    {Number.isNaN(rainfallAnalysis.storageEfficiency) && 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Storage Efficiency</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    Month {rainfallAnalysis.peakMonth}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Peak Harvest</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                    {!Number.isNaN(rainfallAnalysis.peakHarvest) && rainfallAnalysis.peakHarvest.toLocaleString()}
                    {
                      Number.isNaN(rainfallAnalysis.peakHarvest) && "0" 
                    }
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Peak Volume (L)</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Distribution</h4>
                <div className="grid grid-cols-6 gap-2">
                  {rainfallAnalysis.monthly.map((volume, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-blue-200 dark:bg-blue-800 rounded p-2 mb-1">
                        <div 
                          className="bg-blue-600 dark:bg-blue-400 rounded"
                          style={{ height: `${Math.max(20, (volume / Math.max(...rainfallAnalysis.monthly)) * 60)}px` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{volume.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">M{index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Optimization */}
          <Card className="bg-white/20 backdrop-blur-md border-black/20 dark:border-white/10 dark:bg-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Ruler className="h-5 w-5" />
                Storage Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommended Structure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{storageOptimization.structureType}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Dimensions: {storageOptimization.dimensions}</p>
                  <Badge variant={storageOptimization.complexity === 'Basic' ? 'default' : storageOptimization.complexity === 'Intermediate' ? 'secondary' : 'destructive'}>
                    {storageOptimization.complexity}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Storage Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Volume: {storageOptimization.recommendedVolume} m³</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Storage Days: {storageOptimization.storageDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Utilization: {storageOptimization.utilizationRate * 100}%</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/structure')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Detailed Structure Design
              </Button>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="bg-white/20 backdrop-blur-md border-black/20 dark:border-white/10 dark:bg-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Calculator className="h-5 w-5" />
                Detailed Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Materials</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Tank</span>
                      <span className="text-sm font-medium">₹{costBreakdown.materials.tank.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Pipes</span>
                      <span className="text-sm font-medium">₹{costBreakdown.materials.pipes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Filters</span>
                      <span className="text-sm font-medium">₹{costBreakdown.materials.filters.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Pumps</span>
                      <span className="text-sm font-medium">₹{costBreakdown.materials.pumps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Accessories</span>
                      <span className="text-sm font-medium">₹{costBreakdown.materials.accessories.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Labor</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Excavation</span>
                      <span className="text-sm font-medium">₹{costBreakdown.labor.excavation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Installation</span>
                      <span className="text-sm font-medium">₹{costBreakdown.labor.installation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Plumbing</span>
                      <span className="text-sm font-medium">₹{costBreakdown.labor.plumbing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Electrical</span>
                      <span className="text-sm font-medium">₹{costBreakdown.labor.electrical.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Installation Cost</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">₹{costBreakdown.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Sensitivity Analysis */}
          <Card className="bg-white/20 backdrop-blur-md border-black/20 dark:border-white/10 dark:bg-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <BarChart3 className="h-5 w-5" />
                Sensitivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rainfall Sensitivity */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Rainfall Variation Impact</h4>
                  <div className="space-y-2">
                    {sensitivityAnalysis.rainfall.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.variation > 0 ? '+' : ''}{item.variation}%
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₹{item.npv.toLocaleString()}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.change > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.change < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Sensitivity */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Installation Cost Impact</h4>
                  <div className="space-y-2">
                    {sensitivityAnalysis.cost.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.variation > 0 ? '+' : ''}{item.variation}%
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₹{item.npv.toLocaleString()}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.change > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.change < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Water Price Sensitivity */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Water Price Impact</h4>
                  <div className="space-y-2">
                    {sensitivityAnalysis.waterPrice.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.variation > 0 ? '+' : ''}{item.variation}%
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₹{item.npv.toLocaleString()}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.change > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.change < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Risk Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Most Sensitive:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {Math.abs(sensitivityAnalysis.rainfall[0].change) > Math.abs(sensitivityAnalysis.cost[0].change) && 
                       Math.abs(sensitivityAnalysis.rainfall[0].change) > Math.abs(sensitivityAnalysis.waterPrice[0].change) 
                        ? 'Rainfall' : 
                       Math.abs(sensitivityAnalysis.cost[0].change) > Math.abs(sensitivityAnalysis.waterPrice[0].change)
                        ? 'Installation Cost' : 'Water Price'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Investment Risk:</span>
                    <span className={`ml-2 ${
                      financialAnalysis.npv > 0 && sensitivityAnalysis.rainfall[0].npv > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {financialAnalysis.npv > 0 && sensitivityAnalysis.rainfall[0].npv > 0 ? 'Low' : 'High'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Recommendation:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {financialAnalysis.npv > 0 ? 'Proceed with investment' : 'Consider alternatives'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {!alert.expected && (inputs.lat && inputs.lon) && (
        <div className={`mt-6 ${glass} px-4 py-3 text-sm text-black/80 dark:text-blue-100/80`}>
          {loadingAlert ? "Checking rain for next 24 hours..." : "No rain expected in the next 24 hours at your location."}
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-black dark:text-blue-100">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      value={value === 0 ? "" : value}  // show empty field if value is 0
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? 0 : Number(val)); // treat empty as 0 internally
      }}
      className="w-full h-10 rounded-lg border border-black bg-white/40 px-3 text-sm text-black outline-none ring-1 ring-black/20 backdrop-blur focus:border-black focus:ring-black/30 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
    />
  );
}

