import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  showGrade?: boolean;
  animated?: boolean;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  showGrade = true,
  animated = true,
  className
}) => {
  const [currentScore, setCurrentScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setCurrentScore(score);
      return;
    }
    
    // Quick animation to the target score
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(Math.round(score * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentScore(score);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score, animated]);

  // Determine color and grade
  let colorClass = "text-emerald-500";
  let dropShadowColor = "rgba(16, 185, 129, 0.4)";
  let grade = "A+";

  if (score < 40) {
    colorClass = "text-red-500";
    dropShadowColor = "rgba(239, 68, 68, 0.4)";
    grade = "F";
  } else if (score < 60) {
    colorClass = "text-amber-500";
    dropShadowColor = "rgba(245, 158, 11, 0.4)";
    grade = "D";
  } else if (score < 75) {
    colorClass = "text-yellow-400";
    dropShadowColor = "rgba(250, 204, 21, 0.4)";
    grade = "C";
  } else if (score < 90) {
    colorClass = "text-accent"; // green
    dropShadowColor = "rgba(34, 197, 94, 0.4)";
    grade = "B";
  }

  const strokeWidth = Math.max(size * 0.08, 4);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentScore / 100) * circumference;

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg className="absolute top-0 left-0 -rotate-90 transform" width={size} height={size}>
        <circle
          className="text-surface-border stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn("stroke-current transition-all duration-1000 ease-out", colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${dropShadowColor})` }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span 
          className="font-display font-bold leading-none text-text-primary"
          style={{ fontSize: size * 0.28 }}
        >
          {currentScore}
        </span>
        {showGrade && (
          <span 
            className={cn("font-bold", colorClass)}
            style={{ fontSize: size * 0.15, marginTop: size * 0.02 }}
          >
            {grade}
          </span>
        )}
      </div>
    </div>
  );
};
