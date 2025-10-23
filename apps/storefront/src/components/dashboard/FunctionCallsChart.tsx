import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AssistantStats } from '../../types/dashboard';

interface FunctionCallsChartProps {
  data: AssistantStats;
}

const FunctionCallsChart: React.FC<FunctionCallsChartProps> = ({ data }) => {
  const chartData = Object.entries(data.functionCalls).map(([name, value]) => ({
    name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    calls: value
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
          <p className="font-medium text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-blue-600">
            Calls: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Function Calls</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No function calls recorded
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Function Calls</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="calls" 
              fill="#10b981" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FunctionCallsChart;