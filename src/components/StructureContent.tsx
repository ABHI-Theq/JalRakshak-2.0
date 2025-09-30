"use client"
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Hammer, 
  Droplets, 
  Ruler, 
  Layers, 
  Wrench, 
  ExternalLink, 
  Search,
  Filter,
  Star,
  Share2,
  Download,
  Scale,
  X,
  Heart
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter } from "next/navigation";

const glass =
  "rounded-2xl bg-white shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:ring-white/10";

type StructureInfo = {
  name: string;
  description: string;
  suitability: string[];
  typicalDims: string;
  materials: string[];
  estCost: string;
  maintenance: string[];
  notes?: string;
  imageUrl?: string;
  diagramUrl?: string;
  maintenanceLevel: 'low' | 'medium' | 'high';
  isHybrid?: boolean;
};

const CATALOG: StructureInfo[] = [
  // Basic Structures
  {
    name: "RCC tank",
    description: "Reinforced concrete storage tank with first-flush and filtration suitable for rooftop collection.",
    suitability: ["Urban rooftops", "Limited ground space", "Potable with treatment"],
    typicalDims: "2m × 2m × 2.5m (10 m³) or modular per demand",
    materials: ["RCC", "PVC/HDPE pipes", "First-flush valve", "Sand/charcoal filter"],
    estCost: "₹ 60,000 – ₹ 1,80,000 for 5–15 m³ (varies by region)",
    maintenance: ["Quarterly cleaning", "Filter media replacement yearly", "Inspect for cracks/leaks"],
    maintenanceLevel: "medium",
    imageUrl: "/images/rcc-tank.jpg",
    diagramUrl: "/diagrams/rcc-tank.svg"
  },
  {
    name: "Recharge pit",
    description: "Percolation pit to recharge groundwater using filtered rooftop/yard runoff.",
    suitability: ["Areas with permeable soil", "Space available in setback", "Reduce flooding"],
    typicalDims: "1.5m × 1.5m × 2–3m depth with gravel and sand filter",
    materials: ["Bricks/RCC rings", "Gravel & sand", "Geo-textile", "PVC pipes"],
    estCost: "₹ 25,000 – ₹ 70,000 depending on depth & lining",
    maintenance: ["Desilt before monsoon", "Inspect inlets", "Replace clogged media as needed"],
    maintenanceLevel: "low",
    imageUrl: "/images/recharge-pit.jpg",
    diagramUrl: "/diagrams/recharge-pit.svg"
  },
  {
    name: "Percolation trench",
    description: "Linear trench to intercept and recharge runoff along plot periphery.",
    suitability: ["Large plots", "Parking and landscapes", "Reduce surface runoff"],
    typicalDims: "0.6–1m wide × 1.5–2m deep, length as required",
    materials: ["Bricks/stones", "Gravel/sand", "Perforated pipes"],
    estCost: "₹ 1,200 – ₹ 2,500 per running meter",
    maintenance: ["Desilt chambers", "Remove debris", "Maintain vegetative cover"],
    maintenanceLevel: "low",
    imageUrl: "/images/percolation-trench.jpg"
  },
  {
    name: "Rain barrel",
    description: "Small capacity HDPE barrel connected to downpipe for basic non-potable reuse.",
    suitability: ["Small homes", "Gardening", "Low cost"],
    typicalDims: "200–500 L drums, elevate on stand with tap",
    materials: ["HDPE barrel", "Tap & overflow pipe", "Leaf screen"],
    estCost: "₹ 3,000 – ₹ 10,000",
    maintenance: ["Clean screen monthly", "Flush after first rains", "Keep covered"],
    maintenanceLevel: "high",
    imageUrl: "/images/rain-barrel.jpg"
  },
  {
    name: "Recharge well",
    description: "Deep bore with recharge filter to inject treated runoff into aquifer where allowed.",
    suitability: ["High runoff sites", "Regulatory approval", "Deeper water table"],
    typicalDims: "150–300mm dia to 30–60m depth with filter pack",
    materials: ["PVC casing", "Gravel pack", "Silt trap", "Filter media"],
    estCost: "₹ 80,000 – ₹ 2,50,000",
    maintenance: ["Desilt traps", "Test water quality periodically", "Regulatory compliance"],
    maintenanceLevel: "medium",
    imageUrl: "/images/recharge-well.jpg"
  },
  {
    name: "Modular underground tank",
    description: "Subsurface modular PP crate tank wrapped in geotextile for high-volume storage under driveways/yards.",
    suitability: ["Space constraints", "Driveway/parking underlay", "Large storage"],
    typicalDims: "Modular crates assembled to 5–50 m³, burial depth 1–2.5 m",
    materials: ["PP crates", "Geotextile", "HDPE liner (optional)", "Inlet/outlet pipes", "Access chamber"],
    estCost: "₹ 3,500 – ₹ 6,000 per m³ + excavation",
    maintenance: ["Inspect access chamber", "Flush silt trap pre-monsoon", "Check liner integrity"],
    maintenanceLevel: "low",
    imageUrl: "/images/modular-tank.jpg"
  },
  {
    name: "Recharge shaft",
    description: "Vertical shaft with filter media to rapidly recharge deeper strata; used where water table is deep.",
    suitability: ["Large campuses", "High runoff areas", "Deep aquifer recharge"],
    typicalDims: "0.6–1 m dia × 10–20 m depth with gravel/sand filter",
    materials: ["Precast RCC rings", "Gravel/sand", "Silt trap", "PVC pipes"],
    estCost: "₹ 1,20,000 – ₹ 3,00,000 (site dependent)",
    maintenance: ["Desilt silt traps", "Inspect media annually", "Ensure safety cover"],
    maintenanceLevel: "medium",
    imageUrl: "/images/recharge-shaft.jpg"
  },
  {
    name: "Infiltration gallery",
    description: "Subsurface gravel trench with perforated pipes to distribute and infiltrate filtered runoff.",
    suitability: ["Sandy soils", "Landscape areas", "Distributed recharge"],
    typicalDims: "0.8–1 m wide × 1.5–2 m deep; length as required",
    materials: ["Perforated HDPE pipes", "Gravel", "Geotextile", "Inspection ports"],
    estCost: "₹ 1,800 – ₹ 3,000 per running meter",
    maintenance: ["Vacuum clean inspection ports", "Replace clogged sections", "Maintain pretreatment"],
    maintenanceLevel: "medium",
    imageUrl: "/images/infiltration-gallery.jpg"
  },
  {
    name: "Soak pit",
    description: "Circular percolation pit filled with brick bats/gravel for small plot recharge.",
    suitability: ["Individual houses", "Low budget", "Non-clayey soils"],
    typicalDims: "1–1.2 m dia × 2–3 m depth",
    materials: ["Brick bats", "Gravel", "PVC pipe", "Top slab with cover"],
    estCost: "₹ 15,000 – ₹ 40,000",
    maintenance: ["Remove silt annually", "Prevent direct debris entry", "Cover securely"],
    maintenanceLevel: "low",
    imageUrl: "/images/soak-pit.jpg"
  },
  {
    name: "Filter chamber",
    description: "Two-chamber sand/charcoal filter for pretreatment of rooftop runoff before storage/recharge.",
    suitability: ["All systems as pretreatment", "Roof runoff polishing"],
    typicalDims: "0.6 m × 0.6 m × 0.9 m per chamber (customizable)",
    materials: ["Bricks/RCC", "Sand", "Gravel", "Charcoal", "Mesh screens"],
    estCost: "₹ 8,000 – ₹ 25,000",
    maintenance: ["Replace media yearly", "Clean screens monthly", "Bypass during first flush if needed"],
    maintenanceLevel: "high",
    imageUrl: "/images/filter-chamber.jpg"
  },

  // Hybrid Structures from Storage Optimization
  {
    name: "RCC tank with first-flush and filter",
    description: "Basic reinforced concrete storage tank ideal for small-scale rainwater harvesting with integrated first-flush diversion and basic filtration. Perfect for volumes up to 5 m³.",
    suitability: ["Small urban rooftops", "Residential buildings", "Potable water with treatment", "Volume ≤ 5 m³", "Basic requirements"],
    typicalDims: "Custom dimensions based on required volume (calculated automatically)",
    materials: ["RCC construction", "PVC/HDPE pipes", "First-flush diverter", "Basic sand/charcoal filter", "Inlet/outlet valves", "Overflow pipe"],
    estCost: "₹ 50,000 – ₹ 1,00,000 for 2-5 m³",
    maintenance: ["Quarterly tank cleaning", "Annual filter media replacement", "First-flush device inspection", "Leak detection", "Gutter cleaning"],
    maintenanceLevel: "medium",
    isHybrid: true,
    notes: "Ideal for small families and basic water needs"
  },
  {
    name: "RCC tank with recharge pit and silt trap",
    description: "Intermediate system combining storage and groundwater recharge with enhanced silt filtration for medium-scale applications. Designed for volumes between 5-15 m³.",
    suitability: ["Medium-sized buildings", "Areas with groundwater recharge potential", "Volume 5-15 m³", "Combined storage-recharge needs", "Moderate water demand"],
    typicalDims: "Custom dimensions based on required volume with integrated recharge pit",
    materials: ["RCC tank", "Recharge pit construction", "Advanced silt trap", "Dual piping system", "Filter media", "Observation well", "Vent pipes"],
    estCost: "₹ 1,00,000 – ₹ 2,50,000 for 5-15 m³",
    maintenance: ["Monthly silt trap cleaning", "Bi-annual recharge pit inspection", "Tank cleaning pre-monsoon", "Filter system maintenance", "Water quality checks"],
    maintenanceLevel: "medium",
    isHybrid: true,
    notes: "Balanced solution for both storage and groundwater recharge"
  },
  {
    name: "Recharge pit + storage tank with advanced filtration",
    description: "Advanced integrated system for large-scale rainwater harvesting combining substantial storage capacity with sophisticated filtration and groundwater recharge. Suitable for volumes above 15 m³.",
    suitability: ["Large buildings/complexes", "High rainfall areas", "Volume > 15 m³", "Commercial applications", "High water demand"],
    typicalDims: "Large custom dimensions with separate recharge and storage components",
    materials: ["Large RCC storage tank", "Deep recharge pit/shaft", "Multi-stage filtration", "Automatic first-flush", "Water quality monitoring", "Pump system", "Control panel"],
    estCost: "₹ 2,50,000 – ₹ 10,00,000+ depending on scale",
    maintenance: ["Weekly system checks", "Advanced filter replacement", "Water quality testing", "Professional maintenance quarterly", "Pump maintenance"],
    maintenanceLevel: "high",
    isHybrid: true,
    notes: "Comprehensive solution for maximum water security"
  },
];

// Enhanced search function
function findStructure(q: string): StructureInfo | null {
  const norm = q.trim().toLowerCase();
  if (!norm) return null;
  
  // Exact match
  const exact = CATALOG.find((s) => s.name.toLowerCase() === norm);
  if (exact) return exact;
  
  // Try partial matches
  const partial = CATALOG.find((s) => s.name.toLowerCase().includes(norm));
  if (partial) return partial;
  
  // Fuzzy matching with scoring for fallback
  const matches = CATALOG.map(structure => ({
    structure,
    score: calculateMatchScore(structure, norm)
  })).filter(match => match.score > 0.3)
     .sort((a, b) => b.score - a.score);
  
  return matches[0]?.structure ?? null;
}

function calculateMatchScore(structure: StructureInfo, query: string): number {
  const nameMatch = structure.name.toLowerCase().includes(query) ? 1 : 0;
  const descMatch = structure.description.toLowerCase().includes(query) ? 0.5 : 0;
  const materialMatch = structure.materials.some(m => m.toLowerCase().includes(query)) ? 0.3 : 0;
  const suitabilityMatch = structure.suitability.some(s => s.toLowerCase().includes(query)) ? 0.4 : 0;
  
  return nameMatch + descMatch + materialMatch + suitabilityMatch;
}

// Extract cost range for filtering
function getCostRange(structure: StructureInfo): [number, number] {
  const costText = structure.estCost;
  const numbers = costText.match(/\d+/g)?.map(Number) || [0, 0];
  return [Math.min(...numbers), Math.max(...numbers)] as [number, number];
}

export default function Structure() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get all URL parameters
  const urlStructure = searchParams.get('structure');
  const urlDimensions = searchParams.get('dimensions');
  const urlVolume = searchParams.get('volume');
  const urlComplexity = searchParams.get('complexity');
  
  const [query, setQuery] = useState(urlStructure || "");
  const [customDimensions, setCustomDimensions] = useState(urlDimensions || "");
  const [customVolume, setCustomVolume] = useState(urlVolume || "");
  const [customComplexity, setCustomComplexity] = useState(urlComplexity || "");
  const [showInfo, setShowInfo] = useState(!!urlStructure);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const info = useMemo(() => findStructure(query), [query]);
  
  // State for enhanced features
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<StructureInfo[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [links, setLinks] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    costRange: [0, 300000] as [number, number],
    suitability: [] as string[],
    maintenanceLevel: [] as string[],
    searchText: "",
    showHybrid: true
  });

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('structure-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    if (urlStructure) {
      setQuery(urlStructure);
      setShowInfo(true);
      if (urlDimensions) setCustomDimensions(urlDimensions);
      if (urlVolume) setCustomVolume(urlVolume);
      if (urlComplexity) setCustomComplexity(urlComplexity);
      fetchRelatedLinks(urlStructure);
    }
  }, [urlStructure, urlDimensions, urlVolume, urlComplexity]);

  // Update URL with all parameters
  const updateURL = (structureName: string, dimensions?: string, volume?: string, complexity?: string) => {
    const params = new URLSearchParams();
    if (structureName) {
      params.set('structure', structureName);
    }
    if (dimensions) {
      params.set('dimensions', dimensions);
    }
    if (volume) {
      params.set('volume', volume);
    }
    if (complexity) {
      params.set('complexity', complexity);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('structure-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Filter structures based on criteria
  const filteredStructures = useMemo(() => {
    return CATALOG.filter(structure => {
      if (!filters.showHybrid && structure.isHybrid) {
        return false;
      }
      
      const [minCost, maxCost] = getCostRange(structure);
      
      // Cost filter
      if (minCost > filters.costRange[1] || maxCost < filters.costRange[0]) {
        return false;
      }
      
      // Suitability filter
      if (filters.suitability.length > 0 && 
          !filters.suitability.some(suit => 
            structure.suitability.some(s => s.toLowerCase().includes(suit.toLowerCase()))
          )) {
        return false;
      }
      
      // Maintenance level filter
      if (filters.maintenanceLevel.length > 0 && 
          !filters.maintenanceLevel.includes(structure.maintenanceLevel)) {
        return false;
      }
      
      // Search text filter
      if (filters.searchText && 
          !calculateMatchScore(structure, filters.searchText)) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  const toggleFavorite = (structureName: string) => {
    setFavorites(prev => 
      prev.includes(structureName) 
        ? prev.filter(f => f !== structureName)
        : [...prev, structureName]
    );
  };

  const toggleComparison = (structure: StructureInfo) => {
    setSelectedForComparison(prev => 
      prev.find(s => s.name === structure.name)
        ? prev.filter(s => s.name !== structure.name)
        : [...prev, structure]
    );
  };

  const handleShowInfo = () => {
    if (query.trim()) {
      setShowInfo(true);
      updateURL(query.trim(), customDimensions, customVolume, customComplexity);
      fetchRelatedLinks(query.trim());
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    // Clear custom data if input is cleared
    if (!value.trim()) {
      setCustomDimensions("");
      setCustomVolume("");
      setCustomComplexity("");
      router.replace('', { scroll: false });
    }
  };

  const handleStructureSelect = (structureName: string) => {
    setQuery(structureName);
    setShowInfo(true);
    updateURL(structureName, customDimensions, customVolume, customComplexity);
    fetchRelatedLinks(structureName);
  };

  // Display dimensions with custom values if available
  const displayDimensions = (info: StructureInfo | null) => {
    if (customDimensions && info?.name === query) {
      return `${customDimensions} ${customVolume ? `(${customVolume})` : ''}`;
    }
    return info?.typicalDims ?? "—";
  };

  const exportStructureInfo = (structure: StructureInfo) => {
    const content = `
Rainwater Harvesting Structure: ${structure.name}
${structure.isHybrid ? 'HYBRID SYSTEM - OPTIMIZED CONFIGURATION' : ''}
================================================

Description: ${structure.description}

${customComplexity ? `System Complexity: ${customComplexity}` : ''}
${customVolume ? `Recommended Volume: ${customVolume}` : ''}

Suitability:
${structure.suitability.map(s => `• ${s}`).join('\n')}

${customDimensions ? `Recommended Dimensions: ${customDimensions}` : `Typical Dimensions: ${structure.typicalDims}`}

Materials Required:
${structure.materials.map(m => `• ${m}`).join('\n')}

Estimated Cost: ${structure.estCost}

Maintenance Requirements:
${structure.maintenance.map(m => `• ${m}`).join('\n')}

Maintenance Level: ${structure.maintenanceLevel}

${structure.notes ? `Additional Notes: ${structure.notes}` : ''}

Generated on: ${new Date().toLocaleDateString()}
${customDimensions ? '\n* Custom dimensions calculated for your specific requirements' : ''}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${structure.name.replace(/\s+/g, '-')}-info.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareStructureInfo = async (structure: StructureInfo) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?structure=${encodeURIComponent(structure.name)}&dimensions=${encodeURIComponent(customDimensions)}&volume=${encodeURIComponent(customVolume)}`;
    const shareText = `Check out this rainwater harvesting structure: ${structure.name}\n\n${structure.description}\n\n${customDimensions ? `Recommended dimensions: ${customDimensions}` : ''}\nCost: ${structure.estCost}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: structure.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n\nView details: ${shareUrl}`);
      alert('Structure info copied to clipboard!');
    }
  };

  async function fetchRelatedLinks(term: string) {
    try {
      setLinksLoading(true);
      setLinksError(null);
      setLinks([]);
      
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)} rainwater harvesting&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch links");
      const data = await res.json();
      const results: Array<{ title: string; pageid: number; snippet: string }> = data?.query?.search ?? [];
      const mapped = results.slice(0, 5).map((r) => ({
        title: r.title,
        url: `https://en.wikipedia.org/?curid=${r.pageid}`,
        snippet: r.snippet?.replace(/<[^>]+>/g, "") ?? "",
      }));
      setLinks(mapped);
    } catch (e: any) {
      setLinksError(e?.message || "Could not load links");
    } finally {
      setLinksLoading(false);
    }
  }

  const allSuitabilityOptions = Array.from(
    new Set(CATALOG.flatMap(s => s.suitability))
  );

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between text-black dark:text-blue-100">
        <div className="flex items-center gap-2">
          <Hammer className="h-6 w-6 text-[#123458] dark:text-blue-300" />
          <span className="text-xl font-bold">{t("navStructure")}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-blue-900/70 dark:text-blue-100/70">{t("structureSubtitle")}</div>
          <Button
            onClick={() => setShowComparison(true)}
            disabled={selectedForComparison.length === 0}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Scale className="h-3 w-3 mr-1" />
            Compare ({selectedForComparison.length})
          </Button>
        </div>
      </header>

      {/* Enhanced Search and Filter Section */}
      <section className={`mb-6 p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-gray-200/40 hover:shadow-gray-500/20 text-black dark:text-blue-100`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F2D46] dark:text-blue-100">
            <Search className="h-5 w-5" /> {t("chooseStructure")}
          </h2>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-8 text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            Filters
          </Button>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); handleShowInfo(); }}>
          <input
            list="structures"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-black bg-white/40 px-3 text-sm text-black placeholder-black/50 outline-none ring-1 ring-black/20 backdrop-blur focus:border-black focus:ring-black/30 dark:border-white/10 dark:bg-white/10 dark:text-blue-100"
            placeholder={t("enterStructurePlaceholder")}
            aria-label="Search for rainwater harvesting structures"
          />
          <datalist id="structures">
            {CATALOG.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
          <Button 
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-[#0F2D46] px-4 text-[#fff6ee] hover:bg-[#123458]"
            disabled={!query.trim()}
          >
            {t("showInfo")}
          </Button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 p-4 border rounded-lg bg-white/50 dark:bg-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cost Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Cost Range (₹)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{filters.costRange[0].toLocaleString()}</span>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="10000"
                    value={filters.costRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      costRange: [prev.costRange[0], parseInt(e.target.value)]
                    }))}
                    className="flex-1"
                  />
                  <span className="text-xs">{filters.costRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Maintenance Level Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Level</label>
                <div className="flex gap-2 flex-wrap">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        maintenanceLevel: prev.maintenanceLevel.includes(level)
                          ? prev.maintenanceLevel.filter(l => l !== level)
                          : [...prev.maintenanceLevel, level]
                      }))}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        filters.maintenanceLevel.includes(level)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hybrid Structures Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Structure Types</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={filters.showHybrid}
                      onChange={(e) => setFilters(prev => ({ ...prev, showHybrid: e.target.checked }))}
                      className="rounded"
                    />
                    Show Hybrid Systems
                  </label>
                </div>
              </div>

              {/* Search within results */}
              <div>
                <label className="block text-sm font-medium mb-2">Search in Structures</label>
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  className="w-full h-8 rounded border px-2 text-sm"
                  placeholder="Filter structures..."
                />
              </div>
            </div>

            {/* Filtered Results */}
            {filters.searchText && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Matching Structures ({filteredStructures.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {filteredStructures.map(structure => (
                    <div
                      key={structure.name}
                      className={`p-2 text-xs border rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                        structure.isHybrid ? 'border-green-300 bg-green-50 dark:bg-green-900/10' : ''
                      }`}
                      onClick={() => handleStructureSelect(structure.name)}
                    >
                      <div className="flex items-center gap-1">
                        {structure.name}
                        {structure.isHybrid && (
                          <span className="text-[10px] bg-green-500 text-white px-1 rounded">Hybrid</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Favorites Quick Access */}
      {favorites.length > 0 && (
        <section className={`mb-6 p-4 ${glass}`}>
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            Your Favorites
          </h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map(favName => {
              const favStructure = CATALOG.find(s => s.name === favName);
              return favStructure ? (
                <button
                  key={favName}
                  onClick={() => handleStructureSelect(favName)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  {favName}
                  {favStructure.isHybrid && (
                    <span className="text-[10px] bg-green-500 text-white px-1 rounded">H</span>
                  )}
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                </button>
              ) : null;
            })}
          </div>
        </section>
      )}

      {showInfo ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Overview with Actions */}
          <div className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-black dark:text-blue-100 flex items-center gap-2">
                  {t("overview")}
                  {info?.isHybrid && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      Hybrid System
                    </span>
                  )}
                </h3>
                {customComplexity && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    System Complexity: <strong>{customComplexity}</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => info && toggleFavorite(info.name)}
                  className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded"
                >
                  <Star className={`h-4 w-4 ${favorites.includes(info?.name || '') ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => info && toggleComparison(info)}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                >
                  <Scale className={`h-4 w-4 ${selectedForComparison.find(s => s.name === info?.name) ? 'text-blue-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => info && exportStructureInfo(info)}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => info && shareStructureInfo(info)}
                  className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded"
                >
                  <Share2 className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            {info ? (
              <>
                <p className="text-black/90 dark:text-blue-100/90 mb-3">{info.description}</p>
                {info.notes && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> {info.notes}
                    </p>
                  </div>
                )}
                {info.imageUrl && (
                  <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-sm">[Image: {info.name}]</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Structure visualization</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-red-600 dark:text-red-400">{t("structureNotFound")}</p>
            )}
          </div>

          {/* Suitability */}
          <div className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500-20`}>
            <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">{t("suitability")}</h3>
            <ul className="list-disc pl-5 text-black/90 dark:text-blue-100/90">
              {(info?.suitability ?? ["—"]).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Dimensions */}
          <div className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-blue-900 dark:text-blue-100">
              <Ruler className="h-4 w-4" /> {t("typicalDimensions")}
              {customDimensions && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Custom
                </span>
              )}
            </h3>
            <p className="text-black/90 dark:text-blue-100/90">{displayDimensions(info)}</p>
            {customDimensions && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                * Custom dimensions calculated for your specific requirements
              </p>
            )}
          </div>

          {/* Materials & Cost */}
          <div className={`p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-blue-900 dark:text-blue-100">
              <Wrench className="h-4 w-4" /> {t("materialsInstallation")}
            </h3>
            <p className="text-black/90 dark:text-blue-100/90">{info ? info.materials.join(", ") : "—"}</p>
            <p className="mt-2 text-blue-900/90 dark:text-blue-100/90">{t("estimatedCost")}: {info?.estCost ?? "—"}</p>
            <p className="mt-1 text-xs text-blue-900/60 dark:text-blue-100/60">{t("costsVary")}</p>
          </div>

          {/* Maintenance */}
          <div className={`md:col-span-2 p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
            <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">{t("maintenance")}</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm">Level:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                info?.maintenanceLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                info?.maintenanceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {info?.maintenanceLevel || '—'}
              </span>
            </div>
            <ul className="list-disc pl-5 text-black/90 dark:text-blue-100/90">
              {(info?.maintenance ?? ["—"]).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Related Resources */}
          <div className={`md:col-span-2 p-6 ${glass} transition hover:-translate-y-1 hover:shadow-2xl hover:ring-blue-300/40 hover:shadow-blue-500/20`}>
            <h3 className="mb-2 text-base font-semibold text-black dark:text-blue-100">{t("relatedResources")}</h3>
            <p className="text-sm text-black/70 dark:text-blue-100/70 mb-3">
              {t("wikipediaSearchPrefix")} "{query}". {t("helpfulLinksSuffix")}
            </p>
            {linksLoading && (
              <p className="text-sm text-blue-700 dark:text-blue-300">{t("searchingResources")}</p>
            )}
            {linksError && (
              <p className="text-sm text-red-600 dark:text-red-400">{linksError}</p>
            )}
            {!linksLoading && !linksError && links.length === 0 && (
              <p className="text-sm text-black/70 dark:text-blue-100/70">{t("noRelatedLinks")}</p>
            )}
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.url} className="group">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    <ExternalLink className="h-4 w-4 mt-0.5 opacity-70 group-hover:opacity-100" />
                    <span>
                      <span className="font-medium">{l.title}</span>
                      {l.snippet && (
                        <span className="block text-xs text-black/70 dark:text-blue-100/70 mt-0.5">{l.snippet}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className={`p-8 ${glass} text-center`}>
          <div className="flex flex-col items-center gap-4">
            <Layers className="h-16 w-16 text-blue-400 dark:text-blue-500" />
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">{t("selectAStructure")}</h3>
            <p className="text-blue-700 dark:text-blue-300 max-w-md">
              {t("enterStructureHelp")}
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-600 dark:text-blue-400">
              {CATALOG.slice(0, 6).map(structure => (
                <button
                  key={structure.name}
                  onClick={() => handleStructureSelect(structure.name)}
                  className="hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1 justify-center"
                >
                  • {structure.name}
                  {structure.isHybrid && (
                    <span className="text-[10px] bg-green-500 text-white px-1 rounded">H</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${glass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compare Structures</h3>
              <button onClick={() => setShowComparison(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {selectedForComparison.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      {selectedForComparison.map(structure => (
                        <th key={structure.name} className="text-left p-2 border-l">
                          <div className="flex items-center gap-1">
                            {structure.name}
                            {structure.isHybrid && (
                              <span className="text-[10px] bg-green-500 text-white px-1 rounded">H</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Description</td>
                      {selectedForComparison.map(structure => (
                        <td key={structure.name} className="p-2 border-l text-xs">
                          {structure.description}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Cost</td>
                      {selectedForComparison.map(structure => (
                        <td key={structure.name} className="p-2 border-l">
                          {structure.estCost}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Maintenance Level</td>
                      {selectedForComparison.map(structure => (
                        <td key={structure.name} className="p-2 border-l">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            structure.maintenanceLevel === 'low' ? 'bg-green-100 text-green-800' :
                            structure.maintenanceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {structure.maintenanceLevel}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Suitability</td>
                      {selectedForComparison.map(structure => (
                        <td key={structure.name} className="p-2 border-l">
                          <ul className="list-disc pl-4 text-xs">
                            {structure.suitability.slice(0, 3).map(s => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Select structures to compare</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}