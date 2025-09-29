function calculateNPV(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0)
}

function calculateIRR(cashFlows: number[]): number | null {
  let low = -0.9, high = 1.0, guess = 0
  for (let i = 0; i < 100; i++) {
    guess = (low + high) / 2
    const npv = calculateNPV(cashFlows, guess)
    if (Math.abs(npv) < 1e-6) return guess
    if (npv > 0) low = guess
    else high = guess
  }
  return null
}

export function calculateFinancials(storageOptimization: any, costBreakdown: any, inputs: any) {
  const annualSavings = inputs.waterPrice * storageOptimization.optimalSize * 365
  const cashFlows = [-costBreakdown.capital, ...Array(inputs.projectLife).fill(annualSavings - costBreakdown.maintenance)]
  const npv = calculateNPV(cashFlows, inputs.discountRate / 100)
  const irr = calculateIRR(cashFlows)

  return {
    npv,
    irr,
    annualSavings, // ✅ matches what the UI expects
  }
}
