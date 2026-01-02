'use client';

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import type { ChartDataPoint } from '../hooks/use-dashboard-stats';

interface DashboardChartsProps {
  data: ChartDataPoint[];
}

const chartConfig = {
  wt: {
    label: 'Work Units (WT)',
    // Verde Emerald (combina com text-emerald-400 dos cards)
    color: '#10b981',
  },
  sp: {
    label: 'Story Points (SP)',
    // Roxo/Rosa (combina com text-purple-400 dos cards)
    color: '#a855f7',
  },
} satisfies ChartConfig;

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Se não houver dados, não renderiza nada
  if (!data || data.length === 0) return null;

  return (
    <Card className="border-slate-800 bg-slate-900/20">
      <CardHeader>
        <CardTitle>Tendência de Produtividade</CardTitle>
        <CardDescription>
          Comparativo diário entre esforço (Work Units) e complexidade (Story Points).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              width={30}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              width={30}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              yAxisId="left"
              dataKey="wt"
              fill="var(--color-wt)"
              radius={[4, 4, 0, 0]}
              name="Work Units"
              barSize={32}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sp"
              stroke="var(--color-sp)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-sp)' }}
              activeDot={{ r: 6 }}
              name="Story Points"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
