import { create } from 'zustand';

export type BulbType = 'Incandescent' | 'Halogen' | 'CFL' | 'LED';
export type ConsumptionZone = 'Green' | 'Blue' | 'Red';

export interface LightingGroupInput {
  id: string;
  roomName: string;
  bulbType: BulbType;
  wattageOld: number;
  bulbCount: number;
  dailyUsageHours: number;
  dailyUsageHoursHighTariff: number;
  dailyUsageHoursLowTariff: number;
  ledPricePerBulb?: number;
}

interface CalculatorState {
  electricityPrice: number;
  setElectricityPrice: (price: number) => void;
  
  tariffType: 'Single' | 'Dual' | 'Custom';
  setTariffType: (type: 'Single' | 'Dual' | 'Custom') => void;
  
  customPricePerKwh: number;
  setCustomPricePerKwh: (price: number) => void;

  approvedPowerKw: number;
  setApprovedPowerKw: (power: number) => void;

  lightingGroups: LightingGroupInput[];
  addLightingGroup: (group: LightingGroupInput) => void;
  updateLightingGroup: (id: string, group: Partial<LightingGroupInput>) => void;
  removeLightingGroup: (id: string) => void;
  
  consumptionZone: ConsumptionZone;
  setConsumptionZone: (zone: ConsumptionZone) => void;

  ledResult: any | null; // Allow any result type for flexibility with API
  setLedResult: (result: any) => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  electricityPrice: 7.5,
  setElectricityPrice: (price) => set({ electricityPrice: price }),
  
  tariffType: 'Single',
  setTariffType: (type) => set({ tariffType: type }),

  customPricePerKwh: 12.5,
  setCustomPricePerKwh: (price) => set({ customPricePerKwh: price }),

  approvedPowerKw: 6.9,
  setApprovedPowerKw: (power) => set({ approvedPowerKw: power }),

  lightingGroups: [],
  addLightingGroup: (group) => set((state) => ({ 
    lightingGroups: [...state.lightingGroups, group] 
  })),
  updateLightingGroup: (id, group) => set((state) => ({
    lightingGroups: state.lightingGroups.map((g) => 
      g.id === id ? { ...g, ...group } : g
    )
  })),
  removeLightingGroup: (id) => set((state) => ({
    lightingGroups: state.lightingGroups.filter((g) => g.id !== id)
  })),
  
  consumptionZone: 'Green',
  setConsumptionZone: (zone) => set({ consumptionZone: zone }),

  ledResult: null,
  setLedResult: (result) => set({ ledResult: result })
}));
