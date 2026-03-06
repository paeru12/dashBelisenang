import React from 'react';

export function StatCard({ title, value, icon, variant, growth, growthLabel }) {
  const variants = {
    events: 'bg-blue-50 border-blue-200',
    admins: 'bg-purple-50 border-purple-200',
    orders: 'bg-green-50 border-green-200',
    revenue: 'bg-orange-50 border-orange-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${variants[variant] || variants.events}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {growth !== undefined && (
            <p className="text-xs text-green-600 mt-2">
              +{growth}% {growthLabel}
            </p>
          )}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}
