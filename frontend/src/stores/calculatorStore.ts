import { create } from 'zustand';

export type BulbType = 'Incandescent' | 'Halogen' | 'CFL' | 'LED';

export interface LightingGroupInput {
  id: string;
  roomName: string;
  bulbType: BulbType;
  wattageOld: number;
  bulbCount: number;
  dailyUsageHours: number;
  ledPricePerBulb?: number;
}

interface CalculatorState {
  electricityPrice: number;
  setElectricityPrice: (price: number) => void;
  
  lightingGroups: LightingGroupInput[];
  addLightingGroup: (group: LightingGroupInput) => void;
  updateLightingGroup: (id: string, group: Partial<LightingGroupInput>) => void;
  removeLightingGroup: (id: string) => void;
  
  ledResult: any | null; // Allow any result type for flexibility with API
  setLedResult: (result: any) => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  electricityPrice: 12.5, // Default average RSD/kWh in Serbia
  setElectricityPrice: (price) => set({ electricityPrice: price }),
  
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
  
  ledResult: null,
  setLedResult: (result) => set({ ledResult: result })
}));
