import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DistrictMetric, SimulationResult } from './api'

const KIT_COST_RWF = 50000

const formatMoney = (num: number) => {
  const abs = Math.abs(num)
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(2)} billion RWF`
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(2)} million RWF`
  return `${Math.round(abs).toLocaleString('en-US')} RWF`
}

const DISTRICT_NAMES: Record<string, string> = {
  "11": "Nyarugenge", "12": "Gasabo", "13": "Kicukiro",
  "21": "Nyanza", "22": "Gisagara", "23": "Nyaruguru", "24": "Huye", "25": "Nyamagabe", "26": "Ruhango", "27": "Muhanga", "28": "Kamonyi",
  "31": "Karongi", "32": "Rutsiro", "33": "Rubavu", "34": "Nyabihu", "35": "Ngororero", "36": "Rusizi", "37": "Nyamasheke",
  "41": "Rulindo", "42": "Gakenke", "43": "Musanze", "44": "Burera", "45": "Gicumbi",
  "51": "Rwamagana", "52": "Nyagatare", "53": "Gatsibo", "54": "Kayonza", "55": "Kirehe", "56": "Ngoma", "57": "Bugesera"
}

const districtName = (id: string | number) => DISTRICT_NAMES[String(id)] || `District ${id}`

const baselineBiomass = (metric: DistrictMetric) =>
  metric.measured_biomass_reliance_rate ?? metric.biomass_reliance_rate

const nationalBiomassRate = (metrics: Record<string, DistrictMetric> | null): number | null => {
  if (!metrics) return null
  let hh = 0
  let biomassHh = 0
  for (const metric of Object.values(metrics)) {
    hh += metric.estimated_households
    biomassHh += (baselineBiomass(metric) / 100) * metric.estimated_households
  }
  return hh > 0 ? (biomassHh / hh) * 100 : null
}

const weightedGroupRate = (
  metrics: Record<string, DistrictMetric> | null,
  rateKey: 'clean_rate_non_poor' | 'clean_rate_moderate_poor' | 'clean_rate_extreme_poor',
  countKey: 'households_non_poor' | 'households_moderate_poor' | 'households_extreme_poor',
): number | null => {
  if (!metrics) return null
  let hh = 0
  let cleanHh = 0
  for (const metric of Object.values(metrics)) {
    const count = metric[countKey]
    const rate = metric[rateKey]
    if (count == null || rate == null) continue
    hh += count
    cleanHh += (rate / 100) * count
  }
  return hh > 0 ? (cleanHh / hh) * 100 : null
}

const lineMm = (fontSize: number) => fontSize * 1.15 * 0.3528

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
  const carbonPrice = simulationResult?.carbon_price_usd ?? 15

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2
  const footerTop = pageHeight - 12

  const primaryNavy = [15, 23, 42] as [number, number, number]
  const slateDark = [30, 41, 59] as [number, number, number]
  const rwandaBlue = [0, 114, 198] as [number, number, number]
  const rwandaGold = [234, 179, 8] as [number, number, number]
  const rwandaGreen = [22, 163, 74] as [number, number, number]
  const textDark = [15, 23, 42] as [number, number, number]
  const textMuted = [100, 116, 139] as [number, number, number]
  const bgLight = [248, 250, 252] as [number, number, number]
  const borderLight = [226, 232, 240] as [number, number, number]
  const roseAccent = [225, 29, 72] as [number, number, number]

  const paintFlag = (height: number) => {
    doc.setFillColor(...rwandaBlue)
    doc.rect(0, 0, pageWidth * 0.5, height, 'F')
    doc.setFillColor(...rwandaGold)
    doc.rect(pageWidth * 0.5, 0, pageWidth * 0.25, height, 'F')
    doc.setFillColor(...rwandaGreen)
    doc.rect(pageWidth * 0.75, 0, pageWidth * 0.25, height, 'F')
  }

  const wrapped = (text: string, width: number, fontSize: number) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, width) as string[]
    return { lines, height: lines.length * lineMm(fontSize) }
  }

  let currentY = 0

  paintFlag(4)
  currentY = 12

  doc.setFillColor(...rwandaBlue)
  doc.roundedRect(margin, currentY, 12, 12, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(255, 255, 255)
  doc.text('RCEI', margin + 6, currentY + 7, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...textMuted)
  doc.text('2026 NISR Big Data Hackathon  |  Track 3', margin + 16, currentY + 3)

  doc.setFontSize(15)
  doc.setTextColor(...primaryNavy)
  doc.text('Clean cooking decision brief', margin + 16, currentY + 9)

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...textMuted)
  const metaText = `Ref: RCEI-PB-${new Date().getFullYear()}  |  ${dateStr}`
  doc.text(metaText, pageWidth - margin - doc.getTextWidth(metaText), currentY + 3)

  currentY += 16
  const identity = wrapped(
    'Decision support prepared with NISR microdata by the RCEI team. This is not an official NISR or MININFRA publication.',
    contentWidth - 16,
    8,
  )
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...rwandaBlue)
  doc.text(identity.lines, margin + 16, currentY)
  currentY += identity.height + 3

  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.4)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  const measuredBiomass = nationalBiomassRate(metrics)
  const measuredText = measuredBiomass != null ? `${measuredBiomass.toFixed(1)}% (EICV7, household-weighted)` : 'the measured EICV7 rate'
  const nonPoor = weightedGroupRate(metrics, 'clean_rate_non_poor', 'households_non_poor')
  const moderatePoor = weightedGroupRate(metrics, 'clean_rate_moderate_poor', 'households_moderate_poor')
  const extremePoor = weightedGroupRate(metrics, 'clean_rate_extreme_poor', 'households_extreme_poor')
  const crossTab = nonPoor != null && moderatePoor != null && extremePoor != null
    ? ` Measured clean fuel is ${nonPoor.toFixed(2)}% of non-poor households, ${moderatePoor.toFixed(2)}% of moderate poor households, and ${extremePoor.toFixed(2)}% of extreme poor households.`
    : ''
  const summaryText =
    `NST2 aims to reduce the share of households cooking mainly with biomass from ${measuredText} to under 50% by 2029/30. ` +
    `District rates below are measured EICV7 figures. The subsidy path is a disclosed scenario, not a prediction from the fuel classifier.` +
    crossTab

  const summaryBody = wrapped(summaryText, contentWidth - 12, 7.8)
  const summaryHeight = 8 + summaryBody.height + 3
  doc.setFillColor(...bgLight)
  doc.setDrawColor(...borderLight)
  doc.roundedRect(margin, currentY, contentWidth, summaryHeight, 2, 2, 'FD')
  doc.setFillColor(...rwandaBlue)
  doc.rect(margin, currentY, 2.5, summaryHeight, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...primaryNavy)
  doc.text('WHAT THIS BRIEF REPORTS', margin + 6, currentY + 5.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...textDark)
  doc.text(summaryBody.lines, margin + 6, currentY + 10)
  currentY += summaryHeight + 4

  const targetedIds = simulationResult
    ? (simulationResult.target_districts?.length
        ? simulationResult.target_districts.map(String)
        : Object.entries(simulationResult.district_impact ?? {})
            .filter(([, impact]) => impact.converted_households > 0)
            .map(([id]) => id))
    : []
  const isTargeted = Boolean(
    simulationResult?.targeted_districts_count && simulationResult.targeted_districts_count < 30,
  )
  const targetedNames = isTargeted ? targetedIds.map(districtName) : []
  const scenarioText = effectiveSubsidy > 0
    ? (isTargeted
        ? `SCENARIO: ${effectiveSubsidy}% subsidy in ${targetedNames.join(', ') || `${simulationResult?.targeted_districts_count} districts`}`
        : `SCENARIO: ${effectiveSubsidy}% subsidy in all 30 districts`)
    : 'SCENARIO: No subsidy. Measured baseline only.'
  const fiscalText = !simulationResult
    ? ''
    : simulationResult.net_policy_cost_rwf <= 0
      ? `Scenario surplus at $${carbonPrice}/tCO2e: ${formatMoney(Math.abs(simulationResult.net_policy_cost_rwf))}`
      : `Net fiscal cost at $${carbonPrice}/tCO2e: ${formatMoney(simulationResult.net_policy_cost_rwf)}`

  const scenarioBody = wrapped(scenarioText, contentWidth - 8, 8)
  const fiscalBody = fiscalText ? wrapped(fiscalText, contentWidth - 8, 7.5) : { lines: [] as string[], height: 0 }
  const calloutHeight = 4 + scenarioBody.height + (fiscalText ? fiscalBody.height + 1.5 : 0) + 2
  doc.setFillColor(238, 242, 255)
  doc.setDrawColor(199, 210, 254)
  doc.roundedRect(margin, currentY, contentWidth, calloutHeight, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(67, 56, 202)
  doc.text(scenarioBody.lines, margin + 4, currentY + 5)
  if (fiscalText) {
    doc.setFontSize(7.5)
    doc.setTextColor(...(simulationResult && simulationResult.net_policy_cost_rwf <= 0 ? rwandaGreen : primaryNavy))
    doc.text(fiscalBody.lines, margin + 4, currentY + 5 + scenarioBody.height + 1.5)
  }
  currentY += calloutHeight + 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('Scenario indicators', margin, currentY)
  currentY += 4

  const kpiWidth = (contentWidth - 6) / 3
  const kpiHeight = 22
  const convertedHH = simulationResult
    ? `+${Math.round(simulationResult.total_converted_households).toLocaleString('en-US')}`
    : '--'
  const charcoalSaved = simulationResult
    ? `${Math.round(simulationResult.total_annual_charcoal_saved_tons).toLocaleString('en-US')} tonnes`
    : '--'
  const citizenSavings = simulationResult?.avoided_charcoal_expenditure_rwf !== undefined
    ? formatMoney(simulationResult.avoided_charcoal_expenditure_rwf)
    : '--'
  const grossCost = simulationResult ? formatMoney(simulationResult.estimated_budget_rwf || 0) : '--'
  const carbonRevenue = simulationResult ? `+${formatMoney(simulationResult.carbon_credit_revenue_rwf || 0)}` : '--'
  const netCostVal = simulationResult
    ? `${simulationResult.net_policy_cost_rwf < 0 ? '+' : ''}${formatMoney(Math.abs(simulationResult.net_policy_cost_rwf || 0))}`
    : '--'
  const netLabel = simulationResult && simulationResult.net_policy_cost_rwf < 0
    ? 'Scenario surplus'
    : 'Net scenario cost'

  const kpis = [
    [
      { label: 'Households in scenario', value: convertedHH, sub: 'Scenario shift, not observed uptake', color: rwandaGreen },
      { label: 'Charcoal displaced / yr', value: charcoalSaved, sub: 'Charcoal tonnes, not forest area', color: rwandaGold },
      { label: 'Avoided charcoal spend', value: citizenSavings, sub: 'Scenario, from EICV7 expenditure', color: roseAccent },
    ],
    [
      { label: 'Subsidy budget', value: grossCost, sub: `${KIT_COST_RWF.toLocaleString('en-US')} RWF kit, assumption`, color: rwandaBlue },
      { label: 'Carbon revenue', value: carbonRevenue, sub: `$${carbonPrice}/tCO2e, assumption`, color: rwandaGreen },
      { label: netLabel, value: netCostVal, sub: 'At the selected carbon price', color: primaryNavy },
    ],
  ]

  kpis.forEach(row => {
    row.forEach((kpi, idx) => {
      const x = margin + idx * (kpiWidth + 3)
      doc.setFillColor(...bgLight)
      doc.setDrawColor(...borderLight)
      doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')
      doc.setFillColor(...kpi.color)
      doc.rect(x + 2, currentY, kpiWidth - 4, 1.2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(...textMuted)
      doc.text(kpi.label.toUpperCase(), x + 3, currentY + 5.5)
      doc.setFontSize(kpi.value.length > 22 ? 8 : 9.5)
      doc.setTextColor(...kpi.color)
      doc.text(kpi.value, x + 3, currentY + 12)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.2)
      doc.setTextColor(...textMuted)
      const subLines = doc.splitTextToSize(kpi.sub, kpiWidth - 6) as string[]
      doc.text(subLines, x + 3, currentY + 16.5)
    })
    currentY += kpiHeight + 3
  })
  currentY += 3

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...primaryNavy)
  doc.text('National biomass path', margin, currentY)
  currentY += 4

  const slopes = simulationResult?.forecast_slopes
  if (slopes) {
    const slopeText =
      `Business as usual continues the measured EICV5 (2017) to EICV7 (2024) decline of ${slopes.bau_annual_decline_pp.toFixed(2)} points/yr. ` +
      `The policy line uses ${slopes.with_policy_annual_decline_pp.toFixed(2)} points/yr (measured slope plus subsidy/100 x 1.5, an assumption).`
    const slopeBody = wrapped(slopeText, contentWidth, 6.8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...textMuted)
    doc.text(slopeBody.lines, margin, currentY)
    currentY += slopeBody.height + 2
  }

  const forecastData = simulationResult?.forecast ?? []
  const forecastTableBody = forecastData.length > 0
    ? forecastData.map(point => {
        const measuredYear = point.is_historical || point.year <= 2024
        const targetYear = point.year >= 2029
        const status = measuredYear && point.year < 2024
          ? 'Measured'
          : point.year === 2024
            ? 'Measured baseline'
            : targetYear
              ? (point.with_policy <= 50 ? 'Target met' : `${(point.with_policy - 50).toFixed(1)} pt gap`)
              : 'Scenario'
        return [
          point.year.toString(),
          `${point.business_as_usual.toFixed(1)}%`,
          `${point.with_policy.toFixed(1)}%`,
          targetYear ? '< 50%' : '—',
          status,
        ]
      })
    : [['--', 'Run a scenario to populate', '--', '—', '--']]

  autoTable(doc, {
    startY: currentY,
    head: [['Year', 'Business as usual', 'With subsidy scenario', 'NST2 target', 'Status']],
    body: forecastTableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1.6,
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
    margin: { left: margin, right: margin, bottom: 16 },
  })

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6

  const focusNames = metrics
    ? Object.entries(metrics)
        .filter(([, metric]) => (metric.poverty_rate ?? 0) > 30)
        .sort((a, b) => baselineBiomass(b[1]) - baselineBiomass(a[1]))
        .slice(0, 3)
        .map(([id]) => districtName(id))
    : []
  const rec1 = focusNames.length > 0
    ? `1. The scenario shift rises with district poverty. Among districts above 30% poverty, the highest measured biomass rates are ${focusNames.join(', ')}. That order is the disclosed rule, not an estimated elasticity.`
    : '1. The scenario shift rises with district poverty. That relationship is the disclosed rule, not an estimated elasticity.'
  const rec2 = `2. Carbon price: CO2e uses a 3.0 factor and is valued at $${carbonPrice}/tCO2e. That price, the 1,300 RWF per USD rate, and the ${KIT_COST_RWF.toLocaleString('en-US')} RWF kit are assumptions.`
  const rec3 = nonPoor != null && moderatePoor != null && extremePoor != null
    ? `3. Measured clean fuel is ${nonPoor.toFixed(2)}% among non-poor households, ${moderatePoor.toFixed(2)}% among moderate poor, and ${extremePoor.toFixed(2)}% among extreme poor. The subsidy scenario does not change that measured pattern.`
    : '3. Team judgment, not a model output: check supply plans against the charcoal tonnes in this brief.'

  const recWidth = contentWidth - 12
  const recBlocks = [rec1, rec2, rec3].map(text => wrapped(text, recWidth, 7.2))
  const recHeight = 8 + recBlocks.reduce((sum, block) => sum + block.height + 2, 0) + 2
  if (currentY + recHeight > footerTop) {
    doc.addPage()
    paintFlag(3)
    currentY = 12
  }
  doc.setFillColor(...bgLight)
  doc.setDrawColor(...borderLight)
  doc.roundedRect(margin, currentY, contentWidth, recHeight, 2, 2, 'FD')
  doc.setFillColor(...rwandaGreen)
  doc.rect(margin, currentY, 2.5, recHeight, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...primaryNavy)
  doc.text('NOTES FOR A READER', margin + 6, currentY + 5.5)
  let recY = currentY + 10
  recBlocks.forEach(block => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...textDark)
    doc.text(block.lines, margin + 6, recY)
    recY += block.height + 2
  })

  doc.addPage('a4', 'portrait')
  paintFlag(3)
  currentY = 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...primaryNavy)
  doc.text('District baseline and scenario impact', margin, currentY)
  currentY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...textMuted)
  const pageTwoIntro = wrapped(
    'All 30 districts, sorted by measured EICV7 biomass. Baseline is the survey rate. Projected biomass is that rate under the subsidy scenario.',
    contentWidth,
    7.8,
  )
  doc.text(pageTwoIntro.lines, margin, currentY)
  currentY += pageTwoIntro.height + 3

  let districtRows: string[][] = []
  if (metrics) {
    const sortedDistricts = Object.entries(metrics).sort(
      (a, b) => baselineBiomass(b[1]) - baselineBiomass(a[1]),
    )
    districtRows = sortedDistricts.map(([id, metric]) => {
      const impact = simulationResult?.district_impact?.[id]
      const baseline = baselineBiomass(metric)
      return [
        districtName(id),
        metric.poverty_rate !== undefined ? `${metric.poverty_rate.toFixed(1)}%` : '--',
        metric.estimated_households.toLocaleString('en-US'),
        `${baseline.toFixed(1)}%`,
        impact ? `${impact.projected_biomass_rate.toFixed(1)}%` : `${baseline.toFixed(1)}%`,
        impact ? Math.round(impact.converted_households).toLocaleString('en-US') : '0',
        impact ? `${Math.round(impact.charcoal_saved_tons).toLocaleString('en-US')} t` : '0 t',
      ]
    })
  }

  autoTable(doc, {
    startY: currentY,
    head: [[
      'District',
      'Poverty',
      'Households',
      'EICV7 biomass',
      'Scenario biomass',
      'Households in scenario',
      'Charcoal',
    ]],
    body: districtRows,
    theme: 'striped',
    styles: {
      fontSize: 6.6,
      cellPadding: 1.2,
      font: 'helvetica',
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'center', textColor: roseAccent, fontStyle: 'bold', cellWidth: 24 },
      4: { halign: 'center', textColor: rwandaBlue, fontStyle: 'bold', cellWidth: 28 },
      5: { halign: 'right', textColor: rwandaGreen, fontStyle: 'bold', cellWidth: 32 },
      6: { halign: 'right', cellWidth: 22 },
    },
    margin: { left: margin, right: margin, bottom: 28 },
  })

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 5

  const disclaimer =
    'Generated by Rwanda CleanEnergy Insights for the 2026 NISR Big Data Hackathon. ' +
    'Household fuel, poverty, and the clean-fuel-by-poverty rates are weighted EICV7 results from NISR. ' +
    'A classifier predicts observed cooking fuel and does not predict subsidy response. ' +
    'Subsidy shifts, the kit price, the carbon price, and the exchange rate are disclosed assumptions. ' +
    'This brief is for scenario planning. It is not an official NISR or MININFRA publication.'
  const disclaimerBody = wrapped(disclaimer, contentWidth - 12, 6.7)
  const disclaimerHeight = 8 + disclaimerBody.height + 3
  if (currentY + disclaimerHeight > footerTop) {
    doc.addPage()
    paintFlag(3)
    currentY = 12
  }
  doc.setFillColor(...bgLight)
  doc.setDrawColor(...borderLight)
  doc.roundedRect(margin, currentY, contentWidth, disclaimerHeight, 2, 2, 'FD')
  doc.setFillColor(...slateDark)
  doc.rect(margin, currentY, 2.5, disclaimerHeight, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...primaryNavy)
  doc.text('METHOD AND LIMIT', margin + 6, currentY + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.7)
  doc.setTextColor(...textMuted)
  doc.text(disclaimerBody.lines, margin + 6, currentY + 9)

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...borderLight)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...textMuted)
    doc.text('Rwanda CleanEnergy Insights  |  Hackathon decision brief', margin, pageHeight - 5)
    const pageLabel = `Page ${page} of ${pageCount}`
    doc.text(pageLabel, pageWidth - margin - doc.getTextWidth(pageLabel), pageHeight - 5)
  }

  const filename = effectiveSubsidy > 0
    ? `Rwanda_RCEI_Policy_Brief_${effectiveSubsidy}pct_${carbonPrice}usd.pdf`
    : `Rwanda_RCEI_Policy_Brief_Baseline_${carbonPrice}usd.pdf`
  doc.save(filename)
}
