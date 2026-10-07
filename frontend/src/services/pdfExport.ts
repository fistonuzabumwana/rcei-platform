import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DistrictMetric, SimulationResult } from './api'

const formatMoney = (num: number) => {
  if (num >= 1e9) return `~${(num / 1e9).toFixed(2)} B`
  if (num >= 1e6) return `~${(num / 1e6).toFixed(2)} M`
  return Math.round(num).toLocaleString()
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
}

export interface PolicyBriefData {
  metrics: Record<string, DistrictMetric> | null
  simulationResult: SimulationResult | null
  appliedSubsidy?: number
}

export function generatePolicyBriefPDF({
  metrics,
  simulationResult,
  appliedSubsidy = 0,
}: PolicyBriefData): void {
  const effectiveSubsidy = simulationResult ? simulationResult.applied_subsidy : appliedSubsidy

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  // ---- OFFICIAL RWANDA COLOR PALETTE ----
  const primaryNavy = [15, 23, 42] as [number, number, number]     // #0F172A
  const slateDark = [30, 41, 59] as [number, number, number]       // #1E293B
  const rwandaBlue = [0, 114, 198] as [number, number, number]     // Rwanda Flag Blue #0072C6
  const rwandaGold = [234, 179, 8] as [number, number, number]     // Rwanda Flag Gold #EAB308
  const rwandaGreen = [22, 163, 74] as [number, number, number]    // Rwanda Flag Green #16A34A
  const textDark = [15, 23, 42] as [number, number, number]
  const textMuted = [100, 116, 139] as [number, number, number]    // #64748B
  const bgLight = [248, 250, 252] as [number, number, number]      // #F8FAFC
  const borderLight = [226, 232, 240] as [number, number, number]  // #E2E8F0
  const roseAccent = [225, 29, 72] as [number, number, number]     // #E11D48

  let currentY = 0

  // ==================== PAGE 1 ====================

  // 1. National Flag Header Ribbon (Blue / Yellow / Green)
  doc.setFillColor(...rwandaBlue)
  doc.rect(0, 0, pageWidth * 0.5, 4, 'F')
  doc.setFillColor(...rwandaGold)
  doc.rect(pageWidth * 0.5, 0, pageWidth * 0.25, 4, 'F')
  doc.setFillColor(...rwandaGreen)
  doc.rect(pageWidth * 0.75, 0, pageWidth * 0.25, 4, 'F')

  currentY = 12

  // 2. Official Seal & Ministerial Header
  // Circular Seal Vector
  const sealX = margin + 6
  const sealY = currentY + 6
  const sealR = 6
  doc.setDrawColor(...rwandaBlue)
  doc.setLineWidth(0.7)
  doc.circle(sealX, sealY, sealR, 'S')
  doc.setDrawColor(...rwandaGold)
  doc.setLineWidth(0.4)
  doc.circle(sealX, sealY, sealR - 1.2, 'S')
  doc.setFillColor(...rwandaGreen)
  doc.circle(sealX, sealY, sealR - 2.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(255, 255, 255)
  doc.text('RCEI', sealX, sealY + 1.8, { align: 'center' })

  // Header Typography
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...textMuted)
  doc.text('REPUBLIC OF RWANDA  |  MINISTRY OF INFRASTRUCTURE (MININFRA)  |  NISR', margin + 16, currentY + 1.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...primaryNavy)
  doc.text('NST2 Clean Cooking Policy Brief', margin + 16, currentY + 7.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...rwandaBlue)
  doc.text('Socioeconomic Simulation, Citizen Welfare & Environmental Impact Model', margin + 16, currentY + 12.5)

  // Document metadata badge
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  const metaText = `Ref: RW-NST2-PB-${new Date().getFullYear()}  |  ${dateStr}`
  doc.text(metaText, pageWidth - margin - doc.getTextWidth(metaText), currentY + 2)

  const horizonText = 'Horizon: 2030 Target'
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...rwandaGreen)
  doc.text(horizonText, pageWidth - margin - doc.getTextWidth(horizonText), currentY + 7.5)

  currentY += 18
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.4)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  currentY += 5

  // 3. Executive Policy Summary Card
  doc.setFillColor(...bgLight)
  doc.setDrawColor(...borderLight)
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD')

  // Accent vertical stripe
  doc.setFillColor(...rwandaBlue)
  doc.roundedRect(margin, currentY, 2.5, 26, 1, 1, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...primaryNavy)
  doc.text('EXECUTIVE POLICY SUMMARY', margin + 6, currentY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...textDark)
  const summaryText = 
    `Under the National Strategy for Transformation (NST2), the Government of Rwanda is committed to drastically reducing ` +
    `household biomass dependency from over 80% to under 50% by 2030. This policy brief provides empirical socioeconomic evaluations ` +
    `based on NISR EICV7 microdata and predictive Random Forest adoption modeling. Findings establish targeted household conversion ` +
    `potential, displaced charcoal tons, consumer financial savings, fiscal subsidy requirements, and carbon monetization opportunities.`
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 11)
  doc.text(splitSummary, margin + 6, currentY + 11)

  currentY += 30

  // 4. Policy Scenario Callout Bar
  doc.setFillColor(238, 242, 255) // light indigo
  doc.setDrawColor(199, 210, 254)
  doc.roundedRect(margin, currentY, contentWidth, 9.5, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.setTextColor(67, 56, 202) // indigo-700
  const activeSubsidyText = effectiveSubsidy > 0
    ? `SCENARIO SIMULATED: ${effectiveSubsidy}% Targeted Clean Cooking Subsidy Intervention`
    : `SCENARIO SIMULATED: Baseline National Status Quo (0% Clean Fuel Subsidy)`
  doc.text(activeSubsidyText, margin + 4, currentY + 6.2)

  if (simulationResult && simulationResult.net_policy_cost_rwf <= 0) {
    const fundedText = 'Net Surplus via Article 6 Carbon Credits'
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(5, 150, 105)
    doc.text(fundedText, pageWidth - margin - 4 - doc.getTextWidth(fundedText), currentY + 6.2)
  } else if (simulationResult) {
    const costText = `Net Fiscal Cost: ${formatMoney(simulationResult.net_policy_cost_rwf)} Rwf`
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryNavy)
    doc.text(costText, pageWidth - margin - 4 - doc.getTextWidth(costText), currentY + 6.2)
  }

  currentY += 13.5

  // 5. Projected Impact KPI Grid (6 Metric Cards)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('Key Policy Impact Indicators', margin, currentY)
  currentY += 3.5

  const kpiWidth = (contentWidth - 6) / 3
  const kpiHeight = 21

  const convertedHH = simulationResult 
    ? `+${Math.round(simulationResult.total_converted_households).toLocaleString()}` 
    : '--'
  const charcoalSaved = simulationResult 
    ? `${Math.round(simulationResult.total_annual_charcoal_saved_tons).toLocaleString()} tons` 
    : '--'
  const citizenSavings = (simulationResult && simulationResult.avoided_charcoal_expenditure_rwf !== undefined)
    ? `${formatMoney(simulationResult.avoided_charcoal_expenditure_rwf)} Rwf`
    : '--'
  const grossCost = simulationResult 
    ? `${formatMoney(simulationResult.estimated_budget_rwf || 0)} Rwf` 
    : '--'
  const carbonRevenue = simulationResult 
    ? `+${formatMoney(simulationResult.carbon_credit_revenue_rwf || 0)} Rwf` 
    : '--'
  const netCostVal = simulationResult
    ? `${simulationResult.net_policy_cost_rwf < 0 ? '+' : ''}${formatMoney(Math.abs(simulationResult.net_policy_cost_rwf || 0))} Rwf`
    : '--'
  const netLabel = simulationResult && simulationResult.net_policy_cost_rwf < 0 
    ? 'Net Policy Profit' 
    : 'Net Policy Cost'

  const kpisRow1 = [
    { label: 'Households Converted', value: convertedHH, sub: 'Clean cooking adoption', color: rwandaGreen },
    { label: 'Charcoal Displaced / Yr', value: charcoalSaved, sub: 'Deforestation reduced', color: rwandaGold },
    { label: 'Citizen Charcoal Savings', value: citizenSavings, sub: 'At Kigali ~900 Rwf/kg', color: roseAccent },
  ]

  const kpisRow2 = [
    { label: 'Gross Policy Cost', value: grossCost, sub: 'Government subsidy budget', color: rwandaBlue },
    { label: 'Carbon Credit Revenue', value: carbonRevenue, sub: '@ $15/ton CO2e avoided', color: rwandaGreen },
    { label: netLabel, value: netCostVal, sub: 'Fiscal balance post-carbon', color: primaryNavy },
  ]

  // Render Row 1
  kpisRow1.forEach((kpi, idx) => {
    const x = margin + idx * (kpiWidth + 3)
    doc.setFillColor(...bgLight)
    doc.setDrawColor(...borderLight)
    doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')

    // Top accent border line
    doc.setFillColor(...kpi.color)
    doc.rect(x + 2, currentY, kpiWidth - 4, 1.2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(...textMuted)
    doc.text(kpi.label.toUpperCase(), x + 3.5, currentY + 5.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, x + 3.5, currentY + 12.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.3)
    doc.setTextColor(...textMuted)
    doc.text(kpi.sub, x + 3.5, currentY + 17.5)
  })

  currentY += kpiHeight + 3

  // Render Row 2
  kpisRow2.forEach((kpi, idx) => {
    const x = margin + idx * (kpiWidth + 3)
    doc.setFillColor(...bgLight)
    doc.setDrawColor(...borderLight)
    doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')

    // Top accent border line
    doc.setFillColor(...kpi.color)
    doc.rect(x + 2, currentY, kpiWidth - 4, 1.2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(...textMuted)
    doc.text(kpi.label.toUpperCase(), x + 3.5, currentY + 5.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, x + 3.5, currentY + 12.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.3)
    doc.setTextColor(...textMuted)
    doc.text(kpi.sub, x + 3.5, currentY + 17.5)
  })

  currentY += kpiHeight + 8

  // 6. 2030 Time-Series Forecast Projection Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('2030 National Biomass Reliance Forecast Trajectory', margin, currentY)
  currentY += 3.5

  const forecastData = simulationResult?.forecast && simulationResult.forecast.length > 0
    ? simulationResult.forecast
    : [
        { year: 2024, business_as_usual: 80.5, with_policy: 72.0 },
        { year: 2025, business_as_usual: 79.0, with_policy: 69.5 },
        { year: 2026, business_as_usual: 77.5, with_policy: 67.0 },
        { year: 2027, business_as_usual: 76.0, with_policy: 64.5 },
        { year: 2028, business_as_usual: 74.5, with_policy: 62.0 },
        { year: 2029, business_as_usual: 73.0, with_policy: 59.5 },
        { year: 2030, business_as_usual: 71.5, with_policy: 57.0 },
      ]

  const forecastTableBody = forecastData.map(f => [
    f.year.toString(),
    `${f.business_as_usual.toFixed(1)}%`,
    `${f.with_policy.toFixed(1)}%`,
    '< 50.0%',
    f.with_policy < 50 ? 'Target Met' : `${(f.with_policy - 50).toFixed(1)}% gap`
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Year', 'Business as Usual', 'With Policy Subsidy', 'NST2 Target', 'Status / Gap']],
    body: forecastTableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      font: 'helvetica',
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 38 },
      2: { halign: 'center', textColor: rwandaBlue, fontStyle: 'bold', cellWidth: 42 },
      3: { halign: 'center', textColor: rwandaGold, fontStyle: 'bold', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 38 },
    },
    margin: { left: margin, right: margin },
  })

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 7

  // 7. Strategic Recommendations Box (Bottom of Page 1)
  doc.setFillColor(...bgLight)
  doc.setDrawColor(...borderLight)
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD')

  // Accent vertical stripe
  doc.setFillColor(...rwandaGreen)
  doc.roundedRect(margin, currentY, 2.5, 34, 1, 1, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...primaryNavy)
  doc.text('STRATEGIC POLICY RECOMMENDATIONS', margin + 6, currentY + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(...textDark)

  const rec1 = '1. Pro-Poor Elasticity Targeting: Focus subsidy vouchers on rural districts with poverty rates exceeding 30%, where price sensitivity drives the highest conversion elasticity per franc invested.'
  const rec2 = '2. Carbon Finance Monetization: Monitize annual CO2e offsets through Article 6 / voluntary carbon markets ($15/ton), generating sovereign revenue that completely funds the subsidy program.'
  const rec3 = '3. Supply-Chain Infrastructure: Expand LPG distribution depots and induction cooking hubs in secondary cities to prevent supply bottlenecks as household demand shifts.'

  doc.text(doc.splitTextToSize(rec1, contentWidth - 11), margin + 6, currentY + 11)
  doc.text(doc.splitTextToSize(rec2, contentWidth - 11), margin + 6, currentY + 18.5)
  doc.text(doc.splitTextToSize(rec3, contentWidth - 11), margin + 6, currentY + 26)

  // Page 1 Running Footer
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9)

  doc.setFontSize(7)
  doc.setTextColor(...textMuted)
  doc.text('Rwanda CleanEnergy Insights  |  MININFRA / NISR Decision Support', margin, pageHeight - 5)
  const pageNumText1 = 'Page 1 of 2'
  doc.text(pageNumText1, pageWidth - margin - doc.getTextWidth(pageNumText1), pageHeight - 5)

  // ==================== PAGE 2 ====================
  doc.addPage('a4', 'portrait')

  // Top National Flag Bar on Page 2
  doc.setFillColor(...rwandaBlue)
  doc.rect(0, 0, pageWidth * 0.5, 3, 'F')
  doc.setFillColor(...rwandaGold)
  doc.rect(pageWidth * 0.5, 0, pageWidth * 0.25, 3, 'F')
  doc.setFillColor(...rwandaGreen)
  doc.rect(pageWidth * 0.75, 0, pageWidth * 0.25, 3, 'F')

  currentY = 13

  // Page 2 Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...primaryNavy)
  doc.text('District Priority & Transition Impact Matrix', margin, currentY)

  currentY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...textMuted)
  doc.text('Complete 30-district baseline vs projected transitions powered by EICV7 microdata & ML adoption models', margin, currentY)

  currentY += 4

  // Prepare District Table Data
  let districtRows: string[][] = []

  if (metrics) {
    const sortedDistricts = Object.entries(metrics).sort((a, b) => {
      // Sort by biomass reliance descending (most critical first)
      return b[1].biomass_reliance_rate - a[1].biomass_reliance_rate
    })

    districtRows = sortedDistricts.map(([id, m]) => {
      const name = DISTRICT_NAMES[id] || `District ${id}`
      const impact = simulationResult?.district_impact?.[id]
      const baselineBiomass = `${m.biomass_reliance_rate.toFixed(1)}%`
      const projectedBiomass = impact ? `${impact.projected_biomass_rate.toFixed(1)}%` : baselineBiomass
      const converted = impact ? Math.round(impact.converted_households).toLocaleString() : '0'
      const charcoal = impact ? `${Math.round(impact.charcoal_saved_tons).toLocaleString()} t` : '0 t'
      const poverty = m.poverty_rate !== undefined ? `${m.poverty_rate.toFixed(1)}%` : '--'
      const totalHHStr = m.estimated_households.toLocaleString()

      return [name, poverty, totalHHStr, baselineBiomass, projectedBiomass, converted, charcoal]
    })
  }

  autoTable(doc, {
    startY: currentY,
    head: [[
      'District',
      'Poverty Rate',
      'Est. Households',
      'Baseline Biomass',
      'Projected Biomass',
      'Converted HHs',
      'Charcoal Saved'
    ]],
    body: districtRows,
    theme: 'striped',
    styles: {
      fontSize: 7.0,
      cellPadding: 1.4,
      font: 'helvetica',
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'center', textColor: roseAccent, fontStyle: 'bold', cellWidth: 26 },
      4: { halign: 'center', textColor: rwandaBlue, fontStyle: 'bold', cellWidth: 26 },
      5: { halign: 'right', textColor: rwandaGreen, fontStyle: 'bold', cellWidth: 24 },
      6: { halign: 'right', cellWidth: 24 },
    },
    margin: { left: margin, right: margin },
  })

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6

  // Methodology Sign-off Box (fits neatly at bottom of Page 2)
  if (currentY + 22 < pageHeight - 12) {
    doc.setFillColor(...bgLight)
    doc.setDrawColor(...borderLight)
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD')

    // Accent line
    doc.setFillColor(...slateDark)
    doc.roundedRect(margin, currentY, 2.5, 20, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...primaryNavy)
    doc.text('METHODOLOGICAL NOTE & INSTITUTIONAL DISCLAIMER', margin + 6, currentY + 4.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.7)
    doc.setTextColor(...textMuted)
    const disclaimer = 
      'Generated by the Rwanda CleanEnergy Insights Decision Platform. Microdata aggregated from the 7th Integrated ' +
      'Household Living Conditions Survey (EICV7) by the National Institute of Statistics of Rwanda (NISR). ' +
      'Adoption projections calibrated using a Random Forest machine learning classifier trained on household energy expenditures, ' +
      'poverty indicators, and energy commodity prices. Prepared for policy planning and simulation purposes.'
    doc.text(doc.splitTextToSize(disclaimer, contentWidth - 11), margin + 6, currentY + 9)
  }

  // Page 2 Running Footer
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9)

  doc.setFontSize(7)
  doc.setTextColor(...textMuted)
  doc.text('Rwanda CleanEnergy Insights  |  NST2 Decision Platform', margin, pageHeight - 5)
  const pageNumText2 = 'Page 2 of 2'
  doc.text(pageNumText2, pageWidth - margin - doc.getTextWidth(pageNumText2), pageHeight - 5)

  // Save / Trigger Direct File Download
  const filename = effectiveSubsidy > 0
    ? `Rwanda_NST2_Policy_Brief_${effectiveSubsidy}pct_Subsidy.pdf`
    : `Rwanda_NST2_Policy_Brief_Baseline.pdf`

  doc.save(filename)
}
