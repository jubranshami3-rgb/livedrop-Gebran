import React from 'react';

interface StatusBadgeProps {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-400';
      case 'unhealthy':
        return 'bg-red-400';
      case 'degraded':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDot()}`}></span>
      {label}
    </div>
  );
};

export default StatusBadge;