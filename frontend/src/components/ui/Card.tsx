import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`card ${hover ? 'transition-all hover:shadow-elevated hover:border-brand-accent/20' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export function StatCard({ icon, label, value, trend, color = 'brand-primary' }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          {trend && <p className="mt-1 text-xs text-ink-muted">{trend}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-ink-muted',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    error: 'bg-red-50 text-error',
    info: 'bg-blue-50 text-brand-secondary',
    brand: 'bg-brand-primary/10 text-brand-primary',
  };
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}
