import { apiClient } from './client';

// ─────────────────────────────────────────────────────────────
// LED CALCULATOR
// ─────────────────────────────────────────────────────────────

export interface LightingGroupInputDto {
  roomName: string;
  bulbType: 'Incandescent' | 'Halogen' | 'CFL' | 'T8Fluorescent' | 'MR16' | 'PAR';
  wattageOld: number;
  bulbCount: number;
  dailyUsageHours: number;
  ledPricePerBulb?: number;
}

export interface LedCalculatorInputDto {
  lightingGroups: LightingGroupInputDto[];
  electricityPriceRsd: number;
}

export interface LightingGroupResultDto {
  roomName: string;
  bulbType: string;
  wattageOld: number;
  wattageLed: number;
  bulbCount: number;
  dailyUsageHours: number;
  currentAnnualKwh: number;
  ledAnnualKwh: number;
  annualSavingsKwh: number;
  annualSavingsRsd: number;
  investmentRsd: number;
  paybackMonths: number;
  wattageSavingPercent: number;
}

export interface YearlyProjectionDto {
  year: number;
  cumulativeSavingsRsd: number;
  cumulativeCostWithoutLed: number;
  cumulativeCostWithLed: number;
}

export interface RecommendedProductDto {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  slug: string;
}

export interface LedCalculatorResultDto {
  groupResults: LightingGroupResultDto[];
  totalCurrentAnnualKwh: number;
  totalLedAnnualKwh: number;
  totalAnnualSavingsKwh: number;
  totalAnnualSavingsRsd: number;
  totalMonthlySavingsRsd: number;
  totalInvestmentRsd: number;
  paybackMonths: number;
  co2ReductionKgPerYear: number;
  savingsEfficiencyPercent: number;
  tenYearProjection: YearlyProjectionDto[];
  recommendedProducts: RecommendedProductDto[];
  sessionId?: string;
}

export interface CalculatorSessionSummaryDto {
  id: string;
  createdAt: string;
  totalAnnualSavingsRsd: number;
  totalInvestmentRsd: number;
  paybackMonths: number;
}

// ─────────────────────────────────────────────────────────────
// SMART HOME CALCULATOR
// ─────────────────────────────────────────────────────────────

export interface StandbyDeviceInputDto {
  deviceType: string;
  customName?: string;
  quantity: number;
  customStandbyWatts?: number;
}

export interface VampirePowerInputDto {
  devices: StandbyDeviceInputDto[];
}

export interface SmartPlugInputDto {
  deviceTypes: string[];
  smartPlugPriceRsd: number;
  smartPlugCount: number;
}

export interface ThermostatInputDto {
  heatingType: string;
  monthlyHeatingCostRsd: number;
  currentThermostatType: string;
  zoneCount: number;
  smartThermostatPriceRsd: number;
}

export interface LightingAutomationInputDto {
  annualLightingCostRsd: number;
  automationTypes: string[];
  equipmentCostRsd: number;
}

export interface SolarInputDto {
  availableRoofAreaM2: number;
  annualElectricityCostRsd: number;
  hasNetMetering: boolean;
  netMeteringRateRsd: number;
  installationCostRsd: number;
}

export interface SmartHomeCalculatorInputDto {
  electricityPriceRsd: number;
  vampirePower?: VampirePowerInputDto;
  smartPlug?: SmartPlugInputDto;
  thermostat?: ThermostatInputDto;
  lightingAutomation?: LightingAutomationInputDto;
  solar?: SolarInputDto;
  existingLedAnnualKwh?: number;
}

export interface VampirePowerResultDto {
  deviceResults: {
    deviceName: string;
    quantity: number;
    standbyWatts: number;
    annualKwhPerUnit: number;
    totalAnnualKwh: number;
    totalAnnualCostRsd: number;
  }[];
  totalAnnualKwh: number;
  totalAnnualCostRsd: number;
  percentOfTotalBill: number;
}

export interface SmartPlugResultDto {
  eliminatedAnnualKwh: number;
  annualSavingsRsd: number;
  investmentRsd: number;
  paybackMonths: number;
}

export interface ThermostatResultDto {
  annualSavingsRsd: number;
  savingsPercent: number;
  investmentRsd: number;
  paybackMonths: number;
}

export interface SolarResultDto {
  systemCapacityKwp: number;
  annualProductionKwh: number;
  annualSavingsRsd: number;
  investmentRsd: number;
  paybackMonths: number;
  co2OffsetKg: number;
  coveredConsumptionPercent: number;
}

export interface SmartHomeCalculatorResultDto {
  smartHomeScore: number;
  scoreGrade: string;
  scoreInsights: string[];
  vampirePowerResult?: VampirePowerResultDto;
  smartPlugResult?: SmartPlugResultDto;
  thermostatResult?: ThermostatResultDto;
  solarResult?: SolarResultDto;
  totalAnnualSavingsRsd: number;
  totalAnnualSavingsKwh: number;
  totalInvestmentRsd: number;
  averagePaybackMonths: number;
  co2ReductionKgPerYear: number;
  tenYearProjection: YearlyProjectionDto[];
  recommendedProducts: RecommendedProductDto[];
  sessionId?: string;
}

// ─────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────

export const calculatorApi = {
  calculateLed: (dto: LedCalculatorInputDto) =>
    apiClient.post<LedCalculatorResultDto>('/api/calculator/led', dto),

  calculateSmartHome: (dto: SmartHomeCalculatorInputDto) =>
    apiClient.post<SmartHomeCalculatorResultDto>('/api/calculator/smarthome', dto),

  getLedSessions: () =>
    apiClient.get<CalculatorSessionSummaryDto[]>('/api/calculator/sessions/led'),

  getSmartHomeSessions: () =>
    apiClient.get<CalculatorSessionSummaryDto[]>('/api/calculator/sessions/smarthome'),

  getLedSession: (id: string) =>
    apiClient.get<LedCalculatorResultDto>(`/api/calculator/sessions/led/${id}`),

  getSmartHomeSession: (id: string) =>
    apiClient.get<SmartHomeCalculatorResultDto>(`/api/calculator/sessions/smarthome/${id}`),
};
