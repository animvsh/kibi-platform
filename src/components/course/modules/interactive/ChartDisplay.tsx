
import React from 'react';
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartDisplayProps {
  chart: {
    type: string;
    description: string;
    data?: {
      labels: string[];
      values: number[];
    };
  };
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chart }) => {
  if (!chart.data) {
    return (
      <Card className="border-2 border-dark-200 bg-dark-500 p-4">
        <p className="text-sm text-gray-300">{chart.description}</p>
        <p className="text-xs text-gray-400 mt-2">Chart visualization placeholder</p>
      </Card>
    );
  }
  
  // Format data for Recharts
  const chartData = chart.data.labels.map((label, index) => ({
    name: label,
    value: chart.data?.values[index]
  }));
  
  return (
    <Card className="border-2 border-dark-200 bg-dark-500 p-4">
      <p className="text-sm text-gray-300 mb-4">{chart.description}</p>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                borderColor: '#374151',
                color: '#F9FAFB'
              }} 
            />
            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartDisplay;
