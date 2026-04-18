import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { formatRSD, formatKwh, formatPercent } from "@/lib/utils";

interface CountUpNumberProps {
  value: number;
  duration?: number;
  format?: 'raw' | 'rsd' | 'kwh' | 'percent';
  className?: string;
  decimals?: number;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 1200,
  format = 'raw',
  className = "",
  decimals = 0
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = currentValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const nextValue = startValue + (value - startValue) * easeOut;
      
      setCurrentValue(nextValue);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  const displayValue = () => {
    switch (format) {
      case 'rsd':
        return formatRSD(currentValue);
      case 'kwh':
        return formatKwh(currentValue);
      case 'percent':
        return formatPercent(currentValue / 100);
      default:
        return currentValue.toLocaleString('sr-RS', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
    }
  };

  return (
    <span ref={ref} className={className}>
      {displayValue()}
    </span>
  );
};
