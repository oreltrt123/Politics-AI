"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MKStat {
  mk_id: number
  name: string
  party: string
  speech_count: number
  impact_score: number
  topic: string
}

interface WeeklyChartProps {
  data: MKStat[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((mk) => ({
    name: mk.name.split(" ").slice(0, 2).join(" "),
    speeches: mk.speech_count,
    impact: Math.round(mk.impact_score),
    topic: mk.topic,
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">חברי הכנסת המשפיעים השבוע</CardTitle>
        <CardDescription>מספר נאומים, ציון השפעה ונושא</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              style={{ fontSize: "12px" }}
            />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: any, props: any) => {
                if (name === "speeches") return [`${value}`, "נאומים"]
                if (name === "impact") return [`${value}`, "ציון השפעה"]
                return [value, name]
              }}
            />
            <Bar dataKey="speeches" fill="hsl(var(--chart-1))" name="נאומים" />
            <Bar dataKey="impact" fill="hsl(var(--chart-2))" name="ציון השפעה" />
          </BarChart>
        </ResponsiveContainer>

        {/* Optional: List by topic */}
        <div className="mt-4">
          {Array.from(new Set(chartData.map((d) => d.topic))).map((topic) => (
            <div key={topic} className="mb-2">
              <strong>{topic}</strong>
              <ul className="ml-4">
                {chartData
                  .filter((mk) => mk.topic === topic)
                  .map((mk) => (
                    <li key={mk.name}>
                      {mk.name}: {mk.speeches} נאומים, ציון {mk.impact}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
