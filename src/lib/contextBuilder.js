import { getStateByName } from '../data/nigeriaStates.js'

export function buildAppContext(store) {
  const {
    reportData,
    projectInfo,
    analysisId,
    selectedState,
    analyses,
    docText,
  } = store

  let context = `
SITEIQ SESSION CONTEXT:
You are the SiteIQ AI assistant — a specialist in Nigerian construction safety and contract intelligence. You have full access to the user's current session data below.
`

  // ── SELECTED STATE + GEO ──
  const stateData = getStateByName(selectedState || 'Lagos')
  if (stateData) {
    context += `
CURRENT NIGERIAN STATE: ${stateData.name}
Zone: ${stateData.zone}
Soil type: ${stateData.soil.type}
Bearing capacity: ${stateData.soil.bearingCapacity}
Water table: ${stateData.soil.waterTable}
Foundation recommendation: ${stateData.soil.foundationRec}
Special considerations: ${stateData.soil.specialConsiderations}
Flood risk: ${stateData.risks.flood}
Erosion risk: ${stateData.risks.erosion}
Extreme heat risk: ${stateData.risks.extremeHeat}
Harmattan risk: ${stateData.risks.harmattan}
Rainy season: ${stateData.rainy.start} to ${stateData.rainy.end}
Peak months: ${stateData.rainy.peakMonths}
Annual rainfall: ${stateData.rainy.annualRainfallMm}mm
Construction impact: ${stateData.rainy.constructionImpact}
Regulatory body: ${stateData.regulatory.body}
Local code: ${stateData.regulatory.localCode}
`
  }

  // ── MOST RECENT ANALYSIS ──
  if (reportData) {
    context += `
MOST RECENT ANALYSIS — ${analysisId || 'Unknown ID'}:
Report title: ${reportData.reportTitle || 'Untitled'}
Project: ${projectInfo?.projectName || 'Unknown'}
Company: ${projectInfo?.companyName || 'Unknown'}
Site location: ${projectInfo?.siteLocation || 'Unknown'}
Construction phase: ${projectInfo?.constructionPhase || 'Unknown'}
Workers on site: ${projectInfo?.workerCount || 'Unknown'}

SAFETY SCORE: ${reportData.safetyScore}/100
CONTRACT SCORE: ${reportData.contractScore}/100
RISK COUNT: ${reportData.riskCount?.high || 0} High, ${reportData.riskCount?.medium || 0} Medium, ${reportData.riskCount?.low || 0} Low

EXECUTIVE SUMMARY:
${reportData.summary || 'No summary available'}

DETECTED ON SITE:
${(reportData.detectedObjects || []).join(', ') || 'No objects detected'}

SAFETY RISKS IDENTIFIED:
${(reportData.risks || []).map((r, i) =>
  `${i + 1}. [${r.severity}] ${r.title}
   Description: ${r.description}
   Regulation: ${r.regulation}
   Required action: ${r.action}`
).join('\n\n') || 'No risks identified'}

CONTRACT OBLIGATIONS:
${(reportData.obligations || []).map((o, i) =>
  `${i + 1}. ${o.obligation}
   Party: ${o.party} | Clause: ${o.clause} | Due: ${o.due} | Status: ${o.status}`
).join('\n') || 'No contract uploaded'}

PENALTY AND RISK CLAUSES:
${(reportData.penaltyClauses || []).map((p, i) =>
  `${i + 1}. [${p.severity}] ${p.title}
   ${p.description}
   Clause: ${p.clause}
   Protection: ${p.action}`
).join('\n\n') || 'No penalty clauses identified'}

PRESCRIPTIVE PM ACTIONS:
${(reportData.pmActions || []).map(a =>
  `Priority ${a.priority}: ${a.action}
   Reason: ${a.reason}
   Deadline: ${a.deadline}`
).join('\n\n') || 'No PM actions generated'}

KEY DATES AND NOTICES:
${(reportData.timeline || []).map(t =>
  `${t.urgent ? '[URGENT] ' : ''}${t.date}: ${t.title} — ${t.description}`
).join('\n') || 'No timeline items'}
`
  } else {
    context += `
MOST RECENT ANALYSIS: No analysis has been run yet in this session. Ask the user to run a site analysis first.
`
  }

  // ── CONTRACT TEXT ──
  if (docText && docText.length > 100) {
    context += `
CONTRACT TEXT (first 3000 characters):
${docText.slice(0, 3000)}
`
  }

  // ── ANALYSIS HISTORY ──
  if (analyses && analyses.length > 0) {
    context += `
ANALYSIS HISTORY (${analyses.length} total projects):
${analyses.slice(0, 5).map((a, i) =>
  `${i + 1}. ${a.projectName || 'Unnamed'} — Safety: ${a.reportData?.safetyScore ?? '?'}/100, Contract: ${a.reportData?.contractScore ?? '?'}/100 (${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Unknown date'})`
).join('\n')}
`
  }

  context += `
IMPORTANT INSTRUCTIONS:
- Always refer to the analysis data above when answering questions
- If asked about risks, reference the specific risks listed above by name
- If asked about contract clauses, reference the actual obligations and penalty clauses
- If asked about regional risks, use the Nigerian state geo data above
- If asked to elaborate on any finding, provide deeper explanation using your construction expertise
- Always be specific — never say "based on your analysis" without referencing the actual data
- Format clause references as [Clause X.X]
- Format regulation references as [Reg: regulation name]
`

  return context
}
