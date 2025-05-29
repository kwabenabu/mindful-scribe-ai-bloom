
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, TrendingUp } from 'lucide-react';

const ProgressMetrics = () => {
  const healthMetrics = [
    {
      title: 'JOURNAL MONITOR',
      status: 'WITHIN RANGE',
      value: '5/5 Entries',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      title: 'GOAL MONITOR',
      status: 'HIGH',
      value: '2.5 Progress',
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20'
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Optimal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Take advantage of your strong consistency by 
            meeting your journal target of 15.5 entries. Your 
            habits are signaling they can take on significant 
            growth today.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-gray-700`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {metric.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${metric.color}`} />
                    <span className={`text-sm ${metric.color}`}>
                      {metric.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressMetrics;
