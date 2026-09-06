import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-xs font-medium',
        secondary:
          'border-border/50 bg-secondary text-secondary-foreground font-medium',
        destructive:
          'border-rose-500/30 bg-rose-500/15 text-rose-300 font-medium border shadow-xs',
        outline: 'border-border/80 bg-muted/40 text-foreground/90 font-medium',
        success:
          'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-medium border shadow-xs',
        warning:
          'border-amber-500/30 bg-amber-500/15 text-amber-300 font-medium border shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
