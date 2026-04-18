import { apiClient } from './apiClient';
import { LightingGroupInput } from '@/stores/calculatorStore';

export interface LedCalculatorRequest {
  electricityPrice: number;
  rooms: LightingGroupInput[];
}

export interface LedCalculationResult {
  totalAnnualSavingsRsd: number;
  totalAnnualSavingsKwh: number;
  paybackMonths: number;
  co2ReductionKg: number;
  totalInvestment: number;
  roomsBreakdown: {
    roomName: string;
    oldConsumptionKwh: number;
    newConsumptionKwh: number;
    savingsRsd: number;
  }[];
  projections: {
    year: number;
    costWithoutLed: number;
    costWithLed: number;
  }[];
  recommendedProducts: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  }[];
}

export const calculateLedSavings = async (data: LedCalculatorRequest): Promise<LedCalculationResult> => {
  try {
    // Attempt real API call
    const response = await apiClient.post<LedCalculationResult>('/calculator/led', data);
    return response.data;
  } catch (error) {
    console.warn("API unavailable, falling back to mock calculator calculation");
    return mockCalculateLedSavings(data);
  }
};

// Mock implementation to unblock UI development
const mockCalculateLedSavings = async (data: LedCalculatorRequest): Promise<LedCalculationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let totalOldConsumption = 0;
      let totalNewConsumption = 0;
      let totalInvestment = 0;
      const roomsBreakdown = [];

      for (const room of data.rooms) {
        // Mock math logic
        const oldKw = room.wattageOld / 1000;
        const newKw = (room.wattageOld * 0.15) / 1000; // LED uses ~15% of incandescent
        
        const oldAnnualKwh = oldKw * room.bulbCount * room.dailyUsageHours * 365;
        const newAnnualKwh = newKw * room.bulbCount * room.dailyUsageHours * 365;
        
        const pricePerBulb = room.ledPricePerBulb || 350;
        const roomInvestment = pricePerBulb * room.bulbCount;
        
        const roomSavingsRsd = (oldAnnualKwh - newAnnualKwh) * data.electricityPrice;

        totalOldConsumption += oldAnnualKwh;
        totalNewConsumption += newAnnualKwh;
        totalInvestment += roomInvestment;

        roomsBreakdown.push({
          roomName: room.roomName || 'Soba',
          oldConsumptionKwh: oldAnnualKwh,
          newConsumptionKwh: newAnnualKwh,
          savingsRsd: roomSavingsRsd
        });
      }

      const totalAnnualSavingsKwh = totalOldConsumption - totalNewConsumption;
      const totalAnnualSavingsRsd = totalAnnualSavingsKwh * data.electricityPrice;
      
      const paybackMonths = totalAnnualSavingsRsd > 0 
        ? (totalInvestment / (totalAnnualSavingsRsd / 12)) 
        : 0;

      const co2ReductionKg = totalAnnualSavingsKwh * 0.4; // rough estimate 0.4kg CO2 per kWh

      const projections = [];
      for (let i = 1; i <= 10; i++) {
        projections.push({
          year: new Date().getFullYear() + i,
          costWithoutLed: Math.round(totalOldConsumption * data.electricityPrice * i),
          costWithLed: Math.round(totalInvestment + (totalNewConsumption * data.electricityPrice * i))
        });
      }

      resolve({
        totalAnnualSavingsRsd: Math.round(totalAnnualSavingsRsd),
        totalAnnualSavingsKwh: Math.round(totalAnnualSavingsKwh),
        paybackMonths: Number(paybackMonths.toFixed(1)),
        co2ReductionKg: Math.round(co2ReductionKg),
        totalInvestment,
        roomsBreakdown,
        projections,
        recommendedProducts: [
          { id: '1', name: 'LumiSave E27 10W Pro', price: 450, imageUrl: 'https://via.placeholder.com/150/22C55E' },
          { id: '2', name: 'LumiSave E14 Cveća 6W', price: 350, imageUrl: 'https://via.placeholder.com/150/1A6B3A' }
        ]
      });
    }, 600); // simulate network delay
  });
};
