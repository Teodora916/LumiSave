import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white hover:bg-primary-hover",
        secondary: "border-transparent bg-surface-subtle text-text-secondary hover:bg-surface-border",
        outline: "text-text-primary border border-surface-border",
        paid: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        pending: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 animate-pulse",
        failed: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        refunded: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        "low-stock": "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse",
        new: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        sale: "border-transparent bg-accent text-white shadow-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
