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
  value: number;
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
  const chartData =
    data && data.length > 0 && data.some((d) => d.value > 0)
      ? data
      : [
          { name: "Mon", value: 3400 },
          { name: "Tue", value: 4200 },
          { name: "Wed", value: 3900 },
          { name: "Thu", value: 5100 },
          { name: "Fri", value: 7800 },
          { name: "Sat", value: 8900 },
          { name: "Sun", value: 6500 },
        ];

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
            itemStyle={{ color: "#22d3ee" }}
          />
          <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TicketTimeChart({ data }: TicketTimeChartProps) {
  const chartData =
    data && data.length > 0 && data.some((d) => d.minutes > 0)
      ? data
      : [
          { time: "11:00 AM", minutes: 8 },
          { time: "12:00 PM", minutes: 14 },
          { time: "1:00 PM", minutes: 18 },
          { time: "2:00 PM", minutes: 10 },
          { time: "5:00 PM", minutes: 12 },
          { time: "6:00 PM", minutes: 22 },
          { time: "7:00 PM", minutes: 26 },
          { time: "8:00 PM", minutes: 15 },
        ];

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
