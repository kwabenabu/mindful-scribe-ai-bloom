
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';

const TrendAnalysis = () => {
  const journalData = [
    { week: 'W1', entries: 3, goals: 2 },
    { week: 'W2', entries: 5, goals: 4 },
    { week: 'W3', entries: 4, goals: 3 },
    { week: 'W4', entries: 6, goals: 5 },
    { week: 'W5', entries: 7, goals: 6 },
    { week: 'W6', entries: 5, goals: 4 },
    { week: 'W7', entries: 8, goals: 7 }
  ];

  const moodData = [
    { day: 'Mon', mood: 7.2 },
    { day: 'Tue', mood: 8.1 },
    { day: 'Wed', mood: 6.8 },
    { day: 'Thu', mood: 7.9 },
    { day: 'Fri', mood: 8.5 },
    { day: 'Sat', mood: 9.2 },
    { day: 'Sun', mood: 8.0 }
  ];

  const chartConfig = {
    entries: {
      label: 'Journal Entries',
      color: '#06b6d4'
    },
    goals: {
      label: 'Goals Completed',
      color: '#10b981'
    },
    mood: {
      label: 'Mood Score',
      color: '#8b5cf6'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Trend Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-white border-gray-600">
            Weekly
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            Monthly
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journal & Goals Trend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Journal & Goals Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={journalData}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="entries"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="goals"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Weekly Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 10]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#moodGradient)"
                  />
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Outlook Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">My Day</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">W</span>
                </div>
                <div>
                  <p className="text-white font-medium">DAILY OUTLOOK</p>
                  <p className="text-gray-400 text-sm">Review today's insights</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <span className="text-2xl">→</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Activities */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            TODAY'S ACTIVITIES
            <Button size="sm" className="bg-white text-black hover:bg-gray-200">
              <span className="text-lg">+</span>
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TrendAnalysis;
