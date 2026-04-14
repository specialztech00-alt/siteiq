import { getStateByName } from '../data/nigeriaStates.js'

export function getFoundationRecommendation(stateName, buildingType) {
  const state = getStateByName(stateName)
  if (!state) return 'State data not available. Commission a site-specific geotechnical investigation.'

  const { bearingCapacity, foundationRec, waterTable } = state.soil
  const bc = bearingCapacity.toLowerCase()

  const typeGuide = {
    residential: {
      low: 'Raft foundation minimum. Piled foundations recommended for structures over 2 storeys.',
      medium: 'Wide strip or raft foundation. Piles for 3+ storeys.',
      high: 'Strip or pad foundations suitable up to 4 storeys. Independent structural engineer sign-off required.',
    },
    commercial: {
      low: 'Piled foundations essential. Bored cast-in-place piles to competent strata. Structural engineer required.',
      medium: 'Raft or piled foundations depending on structural loads. Early geotechnical investigation critical.',
      high: 'Pad or raft foundations for low-rise. Piles recommended for structures over 6 storeys.',
    },
    industrial: {
      low: 'Piled foundations mandatory. Structural assessment of equipment loads required.',
      medium: 'Raft or piles depending on equipment loading. Vibration isolation may be needed.',
      high: 'Pad or raft foundations for standard loads. Consider vibration isolation for heavy equipment.',
    },
  }

  const bcKey = bc.includes('low') ? 'low' : bc.includes('high') ? 'high' : 'medium'
  const typeKey = ['residential', 'commercial', 'industrial'].includes(buildingType)
    ? buildingType
    : 'residential'

  return [
    typeGuide[typeKey][bcKey],
    `Bearing capacity: ${bearingCapacity}.`,
    `Water table: ${waterTable}.`,
    foundationRec,
  ].join(' ')
}

export function getFloodRiskAdvice(stateName) {
  const state = getStateByName(stateName)
  if (!state) return { level: 'Unknown', advice: 'State data not available.' }

  const { flood } = state.risks

  const advice = {
    'Very High': {
      drainage: 'Comprehensive surface water management plan mandatory. Design to 1-in-100-year flood event minimum. Detention basins or attenuation tanks required.',
      floorLevel: 'Finished floor level minimum 900mm above natural ground level. Verify against NIMET flood maps.',
      insurance: 'Flood insurance essential — expect high premiums. Document pre-build flood baseline.',
      action: 'Do not build in identified floodplain without formal Flood Risk Assessment signed by a registered engineer.',
    },
    'High': {
      drainage: 'Surface drainage design to 1-in-50-year storm event. French drains and perimeter channels required.',
      floorLevel: 'Finished floor level minimum 600mm above natural ground level.',
      insurance: 'Flood insurance strongly recommended.',
      action: 'Obtain flood history for specific site from local government. Check proximity to watercourses.',
    },
    'Medium': {
      drainage: 'Standard drainage design to 1-in-10-year storm event. Ensure site graded away from buildings.',
      floorLevel: 'Finished floor level minimum 300mm above natural ground level.',
      insurance: 'Standard building insurance. Check flood clause exclusions.',
      action: 'Observe site during next rain event before construction commences.',
    },
    'Low': {
      drainage: 'Standard drainage. Ensure positive drainage away from foundations.',
      floorLevel: 'Standard finished floor level — local authority minimum applies.',
      insurance: 'Standard building insurance adequate.',
      action: 'No special flood precautions required but maintain good site drainage practices.',
    },
  }

  return {
    level: flood,
    ...((advice[flood] ?? advice['Low'])),
  }
}

export function getSeasonalAdvice(stateName, month) {
  const state = getStateByName(stateName)
  if (!state) return 'State data not available.'

  const { rainy, risks } = state
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const monthIdx = MONTHS.indexOf(month)
  if (monthIdx === -1) return 'Invalid month provided.'

  const startIdx = MONTHS.indexOf(rainy.start)
  const endIdx = MONTHS.indexOf(rainy.end)

  let isRainySeason = false
  if (startIdx <= endIdx) {
    isRainySeason = monthIdx >= startIdx && monthIdx <= endIdx
  } else {
    isRainySeason = monthIdx >= startIdx || monthIdx <= endIdx
  }

  const isPeak = rainy.peakMonths.includes(month)
  const isHarmattan = risks.harmattan !== 'Low' && (monthIdx === 11 || monthIdx <= 2)

  if (isPeak) {
    return `${month} is a peak rainfall month in ${stateName}. ${rainy.constructionImpact} Suspend major earthworks and concrete pours during heavy rain. Protect all excavations.`
  }

  if (isRainySeason) {
    return `${month} is within the rainy season (${rainy.start}–${rainy.end}) in ${stateName}. ${rainy.constructionImpact} Monitor daily weather forecasts and have contingency plans for wet work stoppages.`
  }

  if (isHarmattan) {
    return `${month} is harmattan season in ${stateName}. Dust affects concrete quality — use wind breaks around mixing areas. Protect workers from dust inhalation. Water demand for concrete may increase.`
  }

  return `${month} is in the dry season in ${stateName} — generally good conditions for construction. ${rainy.constructionImpact}`
}

export function getRegionalRiskSummary(stateName) {
  const state = getStateByName(stateName)
  if (!state) return null

  const riskOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
  const { risks } = state

  const riskEntries = Object.entries(risks)
    .map(([key, level]) => ({ key, level, score: riskOrder[level] ?? 0 }))
    .sort((a, b) => b.score - a.score)

  const topRisk = riskEntries[0]
  const highRisks = riskEntries.filter(r => r.score >= 3)
  const riskLabels = {
    flood: 'Flooding',
    erosion: 'Soil Erosion',
    landslide: 'Landslide',
    extremeHeat: 'Extreme Heat',
    harmattan: 'Harmattan Dust',
  }

  return {
    state: state.name,
    zone: state.zone,
    primaryRisk: { label: riskLabels[topRisk.key], level: topRisk.level },
    highRisks: highRisks.map(r => ({ label: riskLabels[r.key], level: r.level })),
    allRisks: riskEntries.map(r => ({ label: riskLabels[r.key], level: r.level, key: r.key })),
    rainySeasonNote: `Rainy season: ${state.rainy.start}–${state.rainy.end}. Peak: ${state.rainy.peakMonths}.`,
    soilNote: `${state.soil.type}. Bearing capacity: ${state.soil.bearingCapacity}.`,
    foundationNote: state.soil.foundationRec,
  }
}

export function getConstructionScore(stateName) {
  const state = getStateByName(stateName)
  if (!state) return { score: 5, label: 'Unknown', description: 'State data not available.' }

  const riskPoints = { 'Very High': 3, 'High': 2, 'Medium': 1, 'Low': 0 }
  const bcPoints = { 'Low': 3, 'Low to Medium': 2.5, 'Medium': 2, 'Medium to High': 1, 'High': 0 }
  const rainfallPoints = state.rainy.annualRainfallMm > 2000 ? 3 : state.rainy.annualRainfallMm > 1500 ? 2 : state.rainy.annualRainfallMm > 1000 ? 1 : 0

  const soilKey = Object.keys(bcPoints).find(k => state.soil.bearingCapacity.toLowerCase().includes(k.toLowerCase())) ?? 'Medium'

  let difficulty = 0
  difficulty += riskPoints[state.risks.flood] ?? 1
  difficulty += riskPoints[state.risks.erosion] ?? 1
  difficulty += bcPoints[soilKey] ?? 2
  difficulty += rainfallPoints

  // Normalise to 1-10
  const maxDifficulty = 12
  const score = Math.round(((maxDifficulty - difficulty) / maxDifficulty) * 9) + 1
  const clamped = Math.max(1, Math.min(10, score))

  let label, description
  if (clamped >= 8) {
    label = 'Favourable'
    description = `${stateName} offers generally favourable construction conditions. Good soil bearing capacity and manageable climate risks.`
  } else if (clamped >= 6) {
    label = 'Moderate'
    description = `${stateName} has moderate construction challenges. Standard precautions and experienced local contractors recommended.`
  } else if (clamped >= 4) {
    label = 'Challenging'
    description = `${stateName} presents significant construction challenges. Specialist geotechnical input and careful seasonal planning required.`
  } else {
    label = 'Very Challenging'
    description = `${stateName} is among Nigeria's most challenging construction environments. Expert engineering input is essential from project inception.`
  }

  return { score: clamped, label, description }
}
