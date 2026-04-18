import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatKwh(kwh: number): string {
  return new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(kwh) + ' kWh';
}

export function formatPercent(decimal: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(decimal);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculatePaybackMonths(investment: number, annualSavings: number): number {
  if (annualSavings <= 0) return -1;
  const monthlySavings = annualSavings / 12;
  return Number((investment / monthlySavings).toFixed(1));
}
