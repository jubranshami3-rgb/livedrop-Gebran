import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'text-gray-600';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {change > 0 ? '+' : ''}{change}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;