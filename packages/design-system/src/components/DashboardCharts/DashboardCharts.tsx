"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export interface RevenueData {
  name: string;
  value: number; // Keep this for backwards compatibility
  sales?: number;
  tax?: number;
  tips?: number;
  processingFee?: number;
}

export interface TicketTimeData {
  time: string;
  minutes: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

interface TicketTimeChartProps {
  data: TicketTimeData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data || [];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip 
            cursor={{ fill: "rgba(255,255,255,0.05)" }} 
            contentStyle={{ 
              backgroundColor: "#09090b", 
              borderColor: "#27272a",
              borderRadius: "12px",
              color: "#f4f4f5"
            }}
          />
          {chartData.length > 0 && chartData[0].sales !== undefined ? (
            <>
              <Bar dataKey="sales" name="Sales" stackId="a" fill="#22d3ee" />
              <Bar dataKey="tax" name="Tax" stackId="a" fill="#3b82f6" />
              <Bar dataKey="tips" name="Tips" stackId="a" fill="#818cf8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="processingFee" name="Processing Fees" stackId="a" fill="#ef4444" radius={[0, 0, 6, 6]} />
            </>
          ) : (
            <Bar dataKey="value" name="Revenue" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TicketTimeChart({ data }: TicketTimeChartProps) {
  const chartData = data || [];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}m`} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#09090b", 
              borderColor: "#27272a",
              borderRadius: "12px",
              color: "#f4f4f5"
            }}
            itemStyle={{ color: "#22d3ee" }}
          />
          <Line 
            type="monotone" 
            dataKey="minutes" 
            stroke="#22d3ee" 
            strokeWidth={3}
            dot={{ fill: "#09090b", stroke: "#22d3ee", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#22d3ee", stroke: "#09090b", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
