import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
}

export const StatCard = ({ label, value, icon, trend }: StatCardProps) => {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
        {trend && <p className="mt-1 text-xs text-success-700">{trend}</p>}
      </div>
      {icon && (
        <div className="rounded-lg bg-primary-50 p-3 text-primary-600">{icon}</div>
      )}
    </div>
  );
};
