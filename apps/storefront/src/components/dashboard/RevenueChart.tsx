import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RevenueAnalytics } from '../../types/dashboard';

interface RevenueChartProps {
  data: RevenueAnalytics;
  type?: 'line' | 'bar';
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, type = 'line' }) => {
  const chartData = data.dailyRevenue.map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Revenue: ${payload[0].value.toFixed(2)}
          </p>
          {payload[1] && (
            <p className="text-sm text-green-600">
              Orders: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Revenue & Orders ({data.period})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[2, 2, 0, 0]} />
              <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue Trend ({data.period})
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1d4ed8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;