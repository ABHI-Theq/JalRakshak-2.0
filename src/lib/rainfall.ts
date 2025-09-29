export function calculateRainfall(inputs: any) {
  const total = 1200 // mock mm/year
  const effectiveHarvest = (total * inputs.roofArea * inputs.runoffCoefficient) / 1000
  const reliability = effectiveHarvest / (inputs.dwellers * inputs.dailyConsumption * 365 / 1000)
  return { total, effectiveHarvest, reliability: Math.min(1, reliability) }
}

export function calculateStorage(rainfallAnalysis: any, inputs: any) {
  const optimalSize = rainfallAnalysis.effectiveHarvest * 0.6
  const reliability = rainfallAnalysis.reliability
  return { optimalSize, reliability }
}
export function calculateCosts(storageOptimization: any, inputs: any) {
  const capital = storageOptimization.optimalSize * inputs.storageCost
  const maintenance = inputs.maintenance
  const total = capital + maintenance * inputs.projectLife
  return {
    capital,
    maintenance,
    projectLife: inputs.projectLife,
    total,
  }
}

