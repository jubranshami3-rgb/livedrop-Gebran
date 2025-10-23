import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AssistantStats } from '../../types/dashboard';

interface IntentDistributionChartProps {
  data: AssistantStats;
}

const IntentDistributionChart: React.FC<IntentDistributionChartProps> = ({ data }) => {
  const chartData = Object.entries(data.intentDistribution).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-blue-600">
            Queries: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            {((payload[0].value / data.totalQueries) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intent Distribution</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Intent Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IntentDistributionChart;