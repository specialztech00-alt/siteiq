/**
 * SiteIQ — All system prompts and prompt builders
 */

export function buildAnalysisPrompt({ siteDescription, detectedObjects, contractText, nerEntities }) {
  const systemPrompt = `You are SiteIQ — an AI construction intelligence system combining the expertise of a NEBOSH-qualified safety officer, a Nigerian construction project manager, and a construction law specialist.

You are trained on:
- CDM 2015 (UK) and OSHA construction safety standards
- Nigerian Factory Act and COREN regulations
- Lagos State Safety Commission guidelines
- NEC4, JCT, and FIDIC contract forms
- Nigerian National Building Code
- ILO construction safety standards for developing countries

NIGERIA-SPECIFIC KNOWLEDGE:
- Most construction fatalities in Nigeria involve: building collapse, falls from height, electrocution, and excavation collapse
- Common violations: no structural engineer supervision, substandard materials, workers without PPE, no site fencing
- Contract issues: unsigned variations, missed EOT windows, unclear payment terms, no retention release mechanism
- Weather hazards: harmattan dust affects concrete quality, rainy season causes excavation instability, high heat causes worker heat stress

Always reference specific regulations when flagging risks.
Always reference specific clause numbers when analysing contracts.
Always provide prescriptive actions — not just observations.
Factor in the provided weather and ground conditions.

TASK:
Analyse the provided construction site conditions and contract, then produce a comprehensive structured JSON report. You MUST return ONLY valid JSON — no markdown, no commentary, no text before or after the JSON object.

SCORING GUIDANCE:
- safetyScore: 100 = perfect compliance, 0 = extreme danger. Deduct heavily for unguarded falls, no PPE, no method statements.
- contractScore: 100 = contractor-friendly balanced contract, 0 = extremely onerous. Deduct for back-to-back risk, unfair LADs, no EoT provisions.

Return exactly this JSON structure (all fields required — use empty arrays [] for absent data, null for absent strings):
{
  "reportTitle": "string — site/project name and analysis type",
  "summary": "string — 3-sentence executive summary covering site conditions, top risk, and contract posture",
  "safetyScore": number,
  "contractScore": number,
  "riskCount": { "high": number, "medium": number, "low": number },
  "detectedObjects": ["array of items observed/detected on site"],
  "safeObservations": ["array of positive safety observations, min 2"],
  "risks": [
    {
      "id": "RISK-001",
      "severity": "High",
      "title": "string",
      "description": "string — specific, actionable description",
      "action": "string — immediate remediation step",
      "regulation": "string — specific reg/standard reference"
    }
  ],
  "obligations": [
    {
      "obligation": "string — what must be done",
      "party": "Contractor",
      "clause": "string — e.g. 'Clause 3.1'",
      "due": "string — e.g. '7 days before commencement'",
      "status": "pending"
    }
  ],
  "penaltyClauses": [
    {
      "severity": "High",
      "title": "string — clause name",
      "description": "string — what triggers the penalty and typical quantum",
      "action": "string — how to avoid or mitigate this clause",
      "clause": "string — clause reference"
    }
  ],
  "timeline": [
    {
      "date": "string — ISO date YYYY-MM-DD or relative like '+14 days'",
      "title": "string",
      "description": "string",
      "urgent": true
    }
  ],
  "pmActions": [
    {
      "priority": 1,
      "action": "string — specific, imperative action",
      "reason": "string — why this is critical",
      "deadline": "string — e.g. 'Immediately', 'Within 24 hours', '7 days'"
    }
  ],
  "notices": [
    {
      "severity": "High",
      "title": "string — type of notice",
      "description": "string — what the notice covers and consequences of not issuing",
      "action": "string — format and submission method",
      "clause": "string — clause reference"
    }
  ]
}

Populate every array with at least 2-3 items where the input data supports it. Be specific — name clauses, cite regulations, give real numbers for LADs where inferable.`;

  const parts = [];

  if (siteDescription) {
    parts.push(`SITE CONDITIONS / DESCRIPTION:\n${siteDescription}`);
  }

  if (detectedObjects && detectedObjects.length > 0) {
    parts.push(`OBJECTS DETECTED BY COMPUTER VISION MODEL:\n${detectedObjects.join(', ')}`);
  }

  if (contractText) {
    // Trim to ~8000 chars to stay within context budget alongside system prompt
    const trimmedContract = contractText.length > 8000
      ? contractText.substring(0, 8000) + '\n\n[... contract continues — summarise obligations from visible text ...]'
      : contractText;
    parts.push(`CONTRACT TEXT:\n${trimmedContract}`);
  } else {
    parts.push('CONTRACT: No contract provided. Focus entirely on safety analysis. Set contractScore to null and return empty arrays for contract-specific fields.');
  }

  if (nerEntities && nerEntities.length > 0) {
    const entityList = nerEntities
      .filter(e => e.score > 0.8)
      .map(e => `${e.word} (${e.entity_group})`)
      .join(', ');
    if (entityList) {
      parts.push(`KEY ENTITIES EXTRACTED BY NER MODEL:\n${entityList}`);
    }
  }

  const userMessage = parts.join('\n\n---\n\n') + '\n\nReturn the complete JSON report now.';

  return { systemPrompt, userMessage };
}

export function buildChatPrompt(contractText) {
  return `You are SiteIQ Contract Analyst — an expert in construction contract law helping site managers and project managers understand their contractual rights and obligations.

You are answering questions about the specific contract provided below. Always:
- Reference exact clause numbers when answering
- Translate legal language into plain English the site manager can act on
- Flag high-risk areas with clear warnings
- Suggest specific protective actions the contractor should take
- Be concise but complete — site managers are busy

${contractText
  ? `CONTRACT TEXT:\n${contractText.substring(0, 10000)}${contractText.length > 10000 ? '\n\n[Contract continues beyond excerpt]' : ''}`
  : 'NOTE: No contract has been uploaded. Answer construction contract questions generally, referencing standard JCT/NEC4/FIDIC provisions where relevant.'}

If a question falls outside the contract scope, answer based on standard industry practice and flag it as general guidance rather than contract-specific advice.`;
}

export function buildAssistantPrompt({ selectedState = 'Lagos', recentProjectTitle = null } = {}) {
  return `You are SiteIQ Construction Assistant — a specialized AI for Nigerian construction professionals. You have deep knowledge of:

SAFETY:
- Nigerian Factory Act Cap F1 LFN 2004
- COREN regulations and standards
- Lagos State Safety Commission guidelines
- CDM 2015 (UK) applied to Nigerian context
- OSHA construction standards
- ILO safety guidelines for developing countries
- Common Nigerian site hazards: building collapse, falls, electrocution, excavation failure

CONTRACTS:
- JCT Standard Building Contract
- NEC4 Engineering and Construction Contract
- FIDIC Red Book 1999
- Nigerian standard public sector contracts
- Extension of time procedures
- Variation and claims management
- Liquidated damages and penalties
- Retention and payment terms

GROUND CONDITIONS:
- Nigerian soil types by state
- Foundation design principles
- Flood risk management
- Rainy season construction planning

CURRENT CONTEXT:
User's selected state: ${selectedState}
${recentProjectTitle ? `Recent analysis: ${recentProjectTitle}` : 'No recent analysis in this session.'}

FORMAT YOUR RESPONSES:
- Use plain English — assume the user is a site manager not a lawyer
- Reference specific regulations using [Reg: regulation name] format
- Reference contract clauses using [Clause X.X] format
- Keep responses under 200 words unless detail is essential
- End each response with 2-3 suggested follow-up questions formatted as:
  FOLLOW_UPS: question1 | question2 | question3`
}

export function buildChatSystemPrompt(appContext) {
  return `You are SiteIQ — an expert AI assistant specialising in Nigerian construction safety and contract intelligence.

You have deep knowledge of:
- Nigerian Factory Act and COREN regulations
- Lagos State Safety Commission guidelines
- CDM 2015, OSHA, and ILO standards
- JCT, NEC4, and FIDIC contract forms
- Nigerian soil conditions and flood risks
- Construction safety for all 37 Nigerian states

${appContext}

RESPONSE STYLE:
- Be specific and reference actual data from the context above
- Keep responses under 200 words unless asked for detail
- Use plain English — not legal jargon
- Reference regulations as [Reg: name]
- Reference clauses as [Clause X.X]
- End responses with 2-3 follow-up question suggestions when helpful, formatted as:
  FOLLOW_UPS: question1 | question2 | question3`
}

// ── Demo scenario data ──────────────────────────────────────────────────────

export const DEMO_SCENARIOS = [
  {
    id: 'foundation',
    label: 'Foundation Works',
    icon: '⛏️',
    tag: 'Excavation • JCT',
    siteDescription: `Site: Residential development, 12-unit block, central London. Activity: Deep excavation for raft foundation, 4.5m depth.

Observations:
- 3 workers operating in the excavation without edge protection or barriers at the top
- No shoring or temporary support visible on east face (sandy soil, risk of collapse)
- Workers not wearing high-visibility vests — site is adjacent to active road
- One operative seen working without hard hat while using pneumatic drill
- No welfare facilities visible within 50 metres of excavation
- Excavator operating within 1m of excavation edge — ground bearing not assessed
- No Method Statement or Risk Assessment visible on site board
- Confined space entry log absent — supervisor unaware of requirement
- Ladder access into excavation at insufficient angle (almost vertical)

Positive notes: Most workers wearing steel toe-cap boots. Some workers wearing high-vis at the perimeter.`,
    contractText: `JCT STANDARD BUILDING CONTRACT WITH QUANTITIES 2016 EDITION

Project: Residential Development — 12 Units, Bethnal Green, London
Employer: Apex Developments Ltd
Contractor: Griffin Construction Ltd
Contract Sum: £2,450,000
Date of Possession: 15 January 2026
Date for Completion: 30 September 2026

CLAUSE 2.3 — POSSESSION OF SITE
The Employer shall give the Contractor possession of the Site on the Date of Possession. Time is of the essence.

CLAUSE 2.29 — RELEVANT EVENTS (EXTENSIONS OF TIME)
The following are Relevant Events: force majeure; exceptionally adverse weather; civil commotion; employer's instructions; delay by statutory undertakers. The Contractor must give written notice within 28 days of becoming aware of any Relevant Event.

CLAUSE 4.7 — LADs (LIQUIDATED AND ASCERTAINED DAMAGES)
Rate: £1,500 per calendar day of delay. The Employer may deduct LADs from any sum certified as due to the Contractor. The Contractor acknowledges this is a genuine pre-estimate of loss.

CLAUSE 4.15 — RETENTION
Retention Percentage: 3%. Half released on practical completion. Half released on expiry of Rectification Period (12 months). Employer holds retention as beneficial owner — no obligation to place in separate account.

CLAUSE 6.1 — CONTRACTOR'S LIABILITY FOR CDM
The Contractor is appointed as Principal Contractor under CDM 2015. The Contractor shall prepare and maintain the Construction Phase Plan, appoint a competent Site Manager, ensure all workers have relevant CSCS cards, and maintain F10 notification.

CLAUSE 6.4 — INSURANCE — CONTRACTOR'S LIABILITY
The Contractor shall maintain Employers' Liability Insurance (minimum £10m), Public Liability Insurance (minimum £5m), and Contractors' All Risk Insurance (£2,450,000 reinstatement value). Evidence of insurance must be provided within 7 days of request.

CLAUSE 8.4 — EMPLOYER'S RIGHT TO TERMINATE
The Employer may terminate the Contract forthwith if the Contractor: (a) suspends works without cause; (b) fails to proceed regularly and diligently; (c) fails to comply with a CDM notice; (d) becomes insolvent. Upon termination, the Contractor has no entitlement to loss of profit on the uncompleted works.

SCHEDULE 2 — NAMED SPECIALISTS
Structural steel: TechSteel Ltd (Employer-nominated). Any delay or defect by named specialist does not entitle the Contractor to an extension of time beyond 7 days.`,
  },
  {
    id: 'scaffolding',
    label: 'Scaffolding Erection',
    icon: '🏗️',
    tag: 'Height Safety • NEC4',
    siteDescription: `Site: Commercial office refurbishment, 6-storey building, Manchester city centre. Activity: Erecting independent tied scaffolding on north and east elevations, working at heights up to 22 metres.

Observations:
- Scaffolding crew of 5 — 2 workers at upper lift (18m) not wearing harnesses or lanyards
- Scaffold boards on 3rd lift have gaps exceeding 25mm — trip hazard and fall risk
- No brick guards or debris netting on any lift despite proximity to public pavement below
- Scaffold not yet inspected by competent person — handover certificate absent
- One worker using mobile phone while carrying materials up a ladder
- Toeboard missing on east elevation 5th lift
- Structural ties on 2nd lift not correctly spaced per TG20:21 guidance
- Materials (loose bricks, mortar board) stored at scaffold edge without restraint
- No exclusion zone demarcated at base of scaffold on public side

Positive notes: Scaffold tag system in use. Emergency contact details posted at site entrance. Workers using appropriate footwear.`,
    contractText: `NEC4 ENGINEERING AND CONSTRUCTION CONTRACT
Option A: Priced Contract with Activity Schedule

Project: Pacific House Office Refurbishment, Manchester
Client: Northgate Property Group plc
Contractor: Elevate Facades Ltd
Total of the Prices: £890,000
Starting Date: 1 February 2026
Completion Date: 31 May 2026

CLAUSE 10 — ACTIONS
The Contractor shall act in a spirit of mutual trust and co-operation. The Contractor shall provide the Works in accordance with the Works Information.

CLAUSE 11.2(13) — COMPENSATION EVENT
A compensation event is an event which is the Client's risk and which causes the Contractor to incur additional cost or delay. The Contractor must notify the Project Manager within 8 weeks of becoming aware of the event; failure to notify timeously bars the Contractor from any entitlement.

CLAUSE 25 — PROGRAMME
The Contractor submits a first programme for acceptance within the period for reply (2 weeks). If the Contractor fails to submit an acceptable programme, the Project Manager may withhold 25% of amounts otherwise due until an acceptable programme is submitted.

CLAUSE 35 — SECTIONAL COMPLETION
Section 1 (North Elevation): 28 February 2026
Section 2 (East Elevation): 31 March 2026
Section 3 (Internal works): 31 May 2026
Delay damages (all sections): £750 per day

CLAUSE 43 — TESTS AND INSPECTIONS
The Contractor shall give the Supervisor 24 hours notice before covering any work. Covered work may be uncovered at the Project Manager's instruction — all costs borne by the Contractor unless the work is shown to be compliant.

CLAUSE 80 — EMPLOYER'S RISKS
Physical conditions that an experienced contractor would not have anticipated at the Contract Date are an Employer's risk. The Contractor must give early warning and notify a compensation event within 8 weeks.

CLAUSE 85 — INSURANCE
The Contractor shall insure the works to their full reinstatement value. Third party liability: £5,000,000 per event. The Contractor is responsible for deductibles.

CLAUSE X20 — KPI SCHEDULE
Safety incidents per month (target: 0): failure to achieve results in 2% reduction of the amount due.
Programme adherence (target: 95%): failure reduces the amount due by 1%.`,
  },
  {
    id: 'roofing',
    label: 'Roofing Works',
    icon: '🏠',
    tag: 'Fall Protection • FIDIC',
    siteDescription: `Site: Industrial warehouse reroofing, single-storey portal frame structure, 8.5m to eaves, Birmingham. Activity: Strip existing profile metal roof sheets and install new insulated standing seam roof panels.

Observations:
- 4 workers on roof without any fall arrest system — no harnesses, no safety lines, no safety net visible
- Roof edge has no edge protection — open drop of 8.5m to hardstanding below
- Fragile roof areas (old rooflights — some polycarbonate, some glass) not marked or protected
- Weather conditions: winds gusting 28mph — borderline for safe working at height (HSE recommends suspension above 32mph but BS 8411 guidance suggests caution above 25mph)
- MEWP (cherry picker) on site but not being used for edge access
- No safety briefing observed — workers commenced immediately on arrival
- Gas stripping torch in use near insulation — no fire extinguisher visible within 10m
- One skylight opening without cover or barrier — 600mm x 900mm drop hazard
- No hot works permit displayed

Positive notes: Hard hats worn by all ground workers. Site manager present. MEWP operator certified.`,
    contractText: `FIDIC CONDITIONS OF CONTRACT FOR CONSTRUCTION (RED BOOK) 1999

Project: Coventry Logistics Hub — Roof Replacement
Employer: BrindlePoint Industrial REIT Ltd
Contractor: Summit Roofing & Cladding Ltd
Contract Price: £340,000 (lump sum)
Commencement Date: 2 March 2026
Time for Completion: 56 days (28 April 2026)
Defects Notification Period: 365 days

SUB-CLAUSE 4.8 — SAFETY PROCEDURES
The Contractor shall comply with all applicable safety regulations. The Contractor shall provide whatever is required to keep the Site and Works in an orderly state, adequate protection to avoid danger. The Employer's Representative may order suspension of any work which appears imminently dangerous.

SUB-CLAUSE 8.4 — EXTENSION OF TIME
The Contractor is entitled to EoT for: Employer's variations; exceptionally adverse climatic conditions; unforeseeable shortages caused by epidemic or government action; any delay caused by the Employer. The Contractor must give notice within 28 days of the event or lose entitlement.

SUB-CLAUSE 8.7 — DELAY DAMAGES
Rate: £500 per day. Maximum: 10% of the Contract Price (£34,000). Delay damages are the Employer's sole remedy for delay (no unliquidated damages for delay).

SUB-CLAUSE 11.1 — COMPLETION OF OUTSTANDING WORK AND REMEDYING DEFECTS
The Contractor shall complete outstanding works and remedy defects notified during the Defects Notification Period at no additional cost to the Employer.

SUB-CLAUSE 13.3 — VARIATION PROCEDURE
All variations must be instructed by the Employer's Representative in writing before execution. Oral instructions do not constitute a valid instruction. The Contractor must submit a variation quotation within 14 days of receiving a variation instruction.

SUB-CLAUSE 17.1 — INDEMNITIES
The Contractor shall indemnify the Employer against all claims arising from the Contractor's operations, except to the extent caused by the Employer's act or omission.

SUB-CLAUSE 18.2 — INSURANCE FOR WORKS AND CONTRACTOR'S EQUIPMENT
The Contractor shall insure the Works for not less than the full replacement cost plus 15% for demolition and professional fees. Third party liability: not less than £2,000,000 per occurrence.`,
  },
  {
    id: 'contract-only',
    label: 'Contract Review',
    icon: '📋',
    tag: 'JCT D&B • Onerous Clauses',
    siteDescription: `Contract review only — no site photo available. Please perform a detailed analysis of the uploaded JCT Design and Build contract, focusing on:

1. Onerous clauses that shift unreasonable risk to the Contractor
2. Payment terms and cash flow risks
3. LADs and their reasonableness relative to contract value
4. Extension of Time provisions and notification requirements
5. Design liability and professional indemnity exposure
6. Termination rights and consequences
7. Required notices and their deadlines
8. Recommended contractor protective actions before signing

Context: Small/medium contractor (turnover ~£5m) considering signing this contract for a £750,000 residential development project.`,
    contractText: `JCT DESIGN AND BUILD CONTRACT 2016 EDITION

Project: Riverside Quarter — Phase 2 (18 residential units)
Employer: Meridian Living Ltd
Contractor: [Contractor to be named]
Contract Sum: £750,000
Date of Possession: 1 May 2026
Date for Completion: 31 December 2026

CLAUSE 2.1 — CONTRACTOR'S OBLIGATIONS
The Contractor shall carry out and complete the Works in a proper and workmanlike manner and in accordance with the Contract Documents, and shall ensure that the design of the Works is fit for purpose (not merely reasonable skill and care). The Contractor accepts full design liability including for any Employer's Requirements documents provided.

CLAUSE 2.15 — CONTRACTOR'S DESIGN
The Contractor warrants that the Works will be fit for the purposes stated in the Employer's Requirements. This warranty survives practical completion and applies for the full statutory limitation period (12 years if executed as a deed).

CLAUSE 4.8 — INTERIM PAYMENTS
Applications for payment shall be made on the last day of each calendar month. Payment shall be made within 14 days of the due date. The Employer may issue a pay-less notice up to 5 days before the final payment date, reducing payment to any amount including nil without further justification required.

CLAUSE 4.14 — RETENTION
Retention: 5% on all works. One moiety released at practical completion. Second moiety released 24 months after practical completion (not standard 12-month Rectification Period — extended at Employer's request). The Employer shall NOT be required to hold retention in a separate trust account.

CLAUSE 4.19 — LIQUIDATED DAMAGES
Rate: £2,500 per calendar day. The Employer may deduct LADs from certified sums at any time after the Date for Completion passes. There is no cap on total LADs. The Contractor acknowledges that this is a genuine pre-estimate of the Employer's loss.

CLAUSE 2.26 — RELEVANT EVENTS
Extension of Time is available only for: Employer's instructions; force majeure (defined narrowly as war or government prohibition only). Weather, labour shortages, material supply issues, and subcontractor delays are expressly excluded from Relevant Events.

CLAUSE 8.9 — EMPLOYER'S TERMINATION FOR CONVENIENCE
The Employer may terminate the Contract for any reason on 7 days' written notice. Upon termination for convenience, the Contractor is entitled to: value of work executed, cost of materials on site, and any unavoidable costs. The Contractor is expressly excluded from recovering loss of profit on the uncompleted Works.

CLAUSE 1.5 — ENTIRE AGREEMENT
This Contract constitutes the entire agreement between the parties. All prior representations, warranties, or assurances (whether written or oral) are excluded. The Contractor may not rely on any pre-contractual statements made by the Employer or its agents.

CLAUSE 3.5 — EMPLOYER'S AGENT
The Employer's Agent acts on behalf of the Employer and has full authority to issue instructions. The Employer's Agent has no duty of independence and shall not be liable to the Contractor for any decision made in good faith. The Contractor has no right of objection to the identity of the Employer's Agent.`,
  },
];

// ── Fallback demo report (used when API calls fail) ─────────────────────────

export const FALLBACK_DEMO_REPORT = {
  reportTitle: 'Foundation Works — Site Safety & Contract Analysis (Demo)',
  summary: 'High-risk excavation site with multiple critical PPE and edge-protection violations identified. The JCT contract contains standard provisions but the LAD rate of £1,500/day requires close programme management. Immediate action required to prevent potential fatalities and contractual losses.',
  safetyScore: 34,
  contractScore: 61,
  riskCount: { high: 4, medium: 3, low: 2 },
  detectedObjects: ['person', 'hard hat', 'excavator', 'ladder', 'safety barrier (partial)', 'pneumatic drill', 'scaffolding board'],
  safeObservations: [
    'Steel toe-cap boots worn by majority of workers on site',
    'Perimeter workers wearing high-visibility vests as required',
    'Site board present with contact details visible',
  ],
  risks: [
    {
      id: 'RISK-001',
      severity: 'High',
      title: 'Unprotected Excavation Edge — Risk of Fatal Fall',
      description: 'Three workers operating inside a 4.5m deep excavation with no edge protection, barriers, or physical barriers at the top of the excavation. A fall from this height is likely to be fatal.',
      action: 'STOP WORK immediately. Install Heras fencing or excavation edge barriers at minimum 1m from excavation lip before allowing any further work in the vicinity. Erect physical barriers complying with BS EN 13374 Class C.',
      regulation: 'Work at Height Regulations 2005, Reg 6; CDM 2015 Reg 22; HSE CIS 69',
    },
    {
      id: 'RISK-002',
      severity: 'High',
      title: 'Unsupported Excavation Face — Collapse Risk',
      description: 'East face of excavation has no shoring, temporary support, or battering in sandy soil. The Angle of Repose for loose sand is approximately 30°. Current vertical face represents imminent collapse risk that could bury workers.',
      action: 'Install hydraulic shoring, sheet piling, or batch excavation face to stable angle (minimum 45° in sandy soil) before any work continues near east face. Engage Geotechnical Engineer to assess soil bearing and specify support solution.',
      regulation: 'CDM 2015 Reg 22; BS 8000-1:2016; HSE HSG185 Excavations guidance',
    },
    {
      id: 'RISK-003',
      severity: 'High',
      title: 'Worker Without PPE — Head Injury Risk',
      description: 'One operative observed without hard hat while operating pneumatic drill. Pneumatic drill vibration and material ejection creates significant head injury risk. No PPE assessment visible.',
      action: 'Issue formal stop-work instruction to the operative. Issue replacement PPE immediately. Record in site safety log. Issue disciplinary warning per company PPE policy. Conduct PPE toolbox talk for all workers on site today.',
      regulation: 'PPE at Work Regulations 2022; Construction (Head Protection) Regulations 1989; HSE INDG174',
    },
    {
      id: 'RISK-004',
      severity: 'High',
      title: 'Excavator Operating at Unsafe Proximity to Excavation',
      description: 'Excavator operating within 1m of excavation edge without ground bearing assessment. Ground loading from machine (typically 3-8 tonnes) could cause edge collapse, potentially burying workers below.',
      action: 'Relocate excavator to minimum 2m from excavation edge or as specified by Geotechnical Engineer. Conduct ground bearing assessment. Install physical stop blocks to prevent plant encroachment.',
      regulation: 'PUWER 1998; CDM 2015 Reg 22; BS 6031:2009 Earthworks',
    },
    {
      id: 'RISK-005',
      severity: 'Medium',
      title: 'No Method Statement or Risk Assessment on Site Board',
      description: 'CDM 2015 requires a Construction Phase Plan (CPP) with specific method statements for high-risk activities. No CPP, MS, or RA visible on site board for excavation works.',
      action: 'Produce specific Method Statement and Risk Assessment for excavation works before next shift. Display on site board. Brief all workers. Record attendance at briefing.',
      regulation: 'CDM 2015 Reg 12; L153 Managing Health and Safety in Construction',
    },
    {
      id: 'RISK-006',
      severity: 'Medium',
      title: 'Inadequate Ladder Access — Trip and Fall Risk',
      description: 'Ladder into excavation observed at near-vertical angle. BS 5395 requires ladders at 75° (1:4 ratio). Near-vertical ladders are extremely difficult to descend safely with tools.',
      action: 'Reposition ladder to correct 75° angle. Tie top of ladder to prevent slipping. Extend ladder at least 1m above top of excavation. Consider installing fixed aluminium ladder with handrails for deep excavation access.',
      regulation: 'Work at Height Regulations 2005 Schedule 5; BS 5395-1:2010; HSE INDG455',
    },
    {
      id: 'RISK-007',
      severity: 'Medium',
      title: 'No Welfare Facilities Within Accessible Distance',
      description: 'No welfare facilities (toilets, washing facilities, rest area) observed within 50 metres of the excavation. CDM 2015 Schedule 2 requires suitable facilities for all workers.',
      action: 'Install welfare unit with WC, washing facilities, and rest area within reasonable walking distance of workface. Minimum 1 toilet per 25 workers (or fraction thereof).',
      regulation: 'CDM 2015 Schedule 2; Construction (Design and Management) Regs 2015',
    },
    {
      id: 'RISK-008',
      severity: 'Low',
      title: 'Workers Not Wearing High-Visibility Vests',
      description: 'Workers inside excavation and adjacent to active road not wearing high-visibility vests. Site is adjacent to public road with vehicle movements.',
      action: 'Enforce mandatory high-visibility Class 2 vest policy for all workers. Include in daily toolbox talk. Post signage at site entrance.',
      regulation: 'PPE at Work Regulations 2022; BS EN ISO 20471:2013 Class 2',
    },
    {
      id: 'RISK-009',
      severity: 'Low',
      title: 'No Confined Space Entry Log',
      description: 'Deep excavation (>1.2m) constitutes a confined space under certain atmospheric conditions. No confined space entry permit or atmospheric monitoring equipment observed.',
      action: 'Assess excavation for confined space risks (gas ingress, oxygen deficiency). If confirmed, implement Permit to Work system, atmospheric monitoring, and rescue arrangements.',
      regulation: 'Confined Spaces Regulations 1997; L101 Safe Work in Confined Spaces',
    },
  ],
  obligations: [
    {
      obligation: 'Notify HSE of project commencement via F10 notification',
      party: 'Contractor',
      clause: 'CDM 2015 Reg 6 / Contract Clause 6.1',
      due: 'Before construction phase begins',
      status: 'overdue',
    },
    {
      obligation: 'Prepare and maintain Construction Phase Plan (CPP)',
      party: 'Contractor',
      clause: 'CDM 2015 Reg 12 / Contract Clause 6.1',
      due: 'Before construction phase begins',
      status: 'overdue',
    },
    {
      obligation: 'Provide evidence of Employers Liability, Public Liability, and CAR insurance',
      party: 'Contractor',
      clause: 'JCT Clause 6.4',
      due: 'Within 7 days of request',
      status: 'pending',
    },
    {
      obligation: 'Issue Extension of Time notice for any Relevant Event',
      party: 'Contractor',
      clause: 'JCT Clause 2.29',
      due: 'Within 28 days of becoming aware',
      status: 'pending',
    },
    {
      obligation: 'Ensure all workers hold valid CSCS cards',
      party: 'Contractor',
      clause: 'JCT Clause 6.1',
      due: 'Ongoing — before each operative commences work',
      status: 'pending',
    },
    {
      obligation: 'Maintain and update site-specific Construction Phase Plan',
      party: 'Contractor',
      clause: 'CDM 2015 Reg 12(3)',
      due: 'Ongoing — review after any significant change',
      status: 'pending',
    },
  ],
  penaltyClauses: [
    {
      severity: 'High',
      title: 'Liquidated and Ascertained Damages',
      description: 'Employer may deduct £1,500 per calendar day of delay against the Contractor. With 258 calendar days remaining on the programme, total potential exposure is £387,000 (15.8% of contract value) — significant for a small contractor.',
      action: 'Maintain detailed programme (Gantt/P6). Issue EoT notices within 28 days for all qualifying events. Document all Employer-caused delays immediately. Consider programme float strategy.',
      clause: 'JCT Clause 4.7',
    },
    {
      severity: 'High',
      title: 'Employer Termination for Cause — CDM Non-Compliance',
      description: 'Employer may terminate immediately if Contractor fails to comply with a CDM notice. Given the current site safety violations, an HSE improvement notice would give Employer grounds for termination with no loss of profit entitlement.',
      action: 'Rectify all safety violations immediately. Ensure CPP is produced and displayed. Brief all site operatives. Document all corrective actions.',
      clause: 'JCT Clause 8.4',
    },
    {
      severity: 'Medium',
      title: 'Retention — Extended Hold at 3%',
      description: 'Employer holds 3% retention throughout the works (approx. £73,500 at contract completion) with second moiety released only after 12-month Rectification Period. Retention is not held in a separate account — risk if Employer becomes insolvent.',
      action: 'Request retention bond or ring-fenced retention account. Document all practical completion items to accelerate PC certificate. Monitor Employer financial health throughout project.',
      clause: 'JCT Clause 4.15',
    },
  ],
  timeline: [
    {
      date: '2026-04-12',
      title: 'IMMEDIATE: Stop work on excavation',
      description: 'Halt all work adjacent to unprotected excavation edges. Install barriers and shoring before resuming.',
      urgent: true,
    },
    {
      date: '2026-04-13',
      title: 'Produce Method Statement and Risk Assessment',
      description: 'Complete site-specific MS and RA for excavation works. Brief all workers. Display on site board.',
      urgent: true,
    },
    {
      date: '2026-04-14',
      title: 'HSE F10 Notification (if not yet submitted)',
      description: 'Submit CDM F10 notification to HSE online portal. Failure is a criminal offence.',
      urgent: true,
    },
    {
      date: '2026-04-19',
      title: 'Insurance documentation to Employer',
      description: 'Employer may request insurance evidence at any time — ensure all policies are current and available.',
      urgent: false,
    },
    {
      date: '2026-09-30',
      title: 'Date for Completion — LADs commence',
      description: '£1,500/day LADs apply from this date. Monitor programme weekly against this milestone.',
      urgent: false,
    },
  ],
  pmActions: [
    {
      priority: 1,
      action: 'STOP WORK on excavation — install edge protection and shoring NOW',
      reason: 'Live fatality risk — workers in 4.5m unprotected excavation with no edge barriers or face support. HSE has power to serve Prohibition Notice which would halt the entire site.',
      deadline: 'Immediately — before next shift',
    },
    {
      priority: 2,
      action: 'Produce CDM Construction Phase Plan and submit HSE F10 notification',
      reason: 'Contractor is Principal Contractor under CDM 2015. Absence of CPP is a criminal offence. Employer can terminate for CDM non-compliance (Clause 8.4).',
      deadline: 'Within 24 hours',
    },
    {
      priority: 3,
      action: 'Conduct safety induction and PPE toolbox talk for all site operatives',
      reason: 'PPE violations observed. All workers must be briefed on site-specific hazards. Record attendance with signatures.',
      deadline: 'Before work recommences tomorrow morning',
    },
    {
      priority: 4,
      action: 'Engage Geotechnical Engineer to assess excavation and specify shoring design',
      reason: 'Sandy soil + 4.5m depth + proximity of plant = high collapse risk. Needs specialist assessment per CDM 2015 Reg 22 and BS 6031.',
      deadline: 'Within 48 hours',
    },
    {
      priority: 5,
      action: 'Review programme against Date for Completion (30 Sept 2026) — issue EoT if delayed',
      reason: 'Work stoppage will extend programme. EoT notice must be issued within 28 days of becoming aware of any Relevant Event to preserve entitlement.',
      deadline: 'Within 7 days',
    },
    {
      priority: 6,
      action: 'Provide evidence of all insurances to Employer',
      reason: 'Contract Clause 6.4 requires EL, PL, and CAR policies. Failure to provide within 7 days of request is a breach.',
      deadline: 'Ensure policies are current — provide within 7 days of any request',
    },
  ],
  notices: [
    {
      severity: 'High',
      title: 'CDM F10 Notification to HSE',
      description: 'Where construction work is expected to last more than 30 working days with more than 20 workers simultaneously, or exceed 500 person-days, the Principal Contractor must notify HSE before construction begins.',
      action: 'Submit online via HSE F10 portal (hse.gov.uk/forms/notification). Display F10 acknowledgment on site board.',
      clause: 'CDM 2015 Regulation 6',
    },
    {
      severity: 'High',
      title: 'Extension of Time Notice — Programme Delay',
      description: 'Any delay caused by a Relevant Event (Employer instructions, exceptional weather, statutory undertaker delays) must be notified within 28 days or the Contractor loses entitlement to EoT and cost recovery.',
      action: 'Serve written notice to Employer specifying: date event arose, nature of Relevant Event, estimated delay to Completion Date. Use recorded delivery.',
      clause: 'JCT Clause 2.29',
    },
    {
      severity: 'Medium',
      title: 'Insurance Evidence Request Response',
      description: 'Employer may request evidence of EL, PL, and CAR insurance policies at any time. Failure to respond within 7 days allows Employer to arrange cover and recover cost from Contractor.',
      action: 'Maintain copies of all policy schedules on site and in head office. Respond to any request within 7 days with certified copies.',
      clause: 'JCT Clause 6.4',
    },
  ],
};
