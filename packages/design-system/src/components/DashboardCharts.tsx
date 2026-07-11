"use client";

import React from "react";
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
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--color-muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip 
            cursor={{ fill: "var(--color-muted)" }} 
            contentStyle={{ 
              backgroundColor: "var(--color-card)", 
              borderColor: "var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-foreground)"
            }}
            itemStyle={{ color: "var(--color-primary)" }}
          />
          <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TicketTimeChart({ data }: TicketTimeChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="var(--color-muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--color-muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}m`} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--color-card)", 
              borderColor: "var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-foreground)"
            }}
            itemStyle={{ color: "var(--color-primary)" }}
          />
          <Line 
            type="monotone" 
            dataKey="minutes" 
            stroke="var(--color-primary)" 
            strokeWidth={3}
            dot={{ fill: "var(--color-card)", stroke: "var(--color-primary)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
