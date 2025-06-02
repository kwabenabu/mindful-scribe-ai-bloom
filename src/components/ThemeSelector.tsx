
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { Palette, Zap, Chrome, Sparkles, Circle } from 'lucide-react';

const themes: { 
  id: Theme; 
  name: string; 
  description: string; 
  icon: React.ReactNode;
  colors: string[];
}[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and minimal design',
    icon: <Circle className="h-4 w-4" />,
    colors: ['bg-blue-500', 'bg-gray-100', 'bg-white']
  },
  {
    id: 'slick',
    name: 'Slick',
    description: 'Modern gradients and smooth animations',
    icon: <Zap className="h-4 w-4" />,
    colors: ['bg-gradient-to-r from-purple-500 to-pink-500', 'bg-gray-900', 'bg-gray-800']
  },
  {
    id: 'apple',
    name: 'Apple',
    description: 'Clean, minimalist Apple-inspired design',
    icon: <Palette className="h-4 w-4" />,
    colors: ['bg-blue-600', 'bg-gray-50', 'bg-white']
  },
  {
    id: 'chrome',
    name: 'Chrome',
    description: 'Sleek metallic with subtle reflections',
    icon: <Chrome className="h-4 w-4" />,
    colors: ['bg-gray-600', 'bg-gray-200', 'bg-gray-100']
  },
  {
    id: 'metallic',
    name: 'Metallic',
    description: 'Luxurious metallic finish with shine effects',
    icon: <Sparkles className="h-4 w-4" />,
    colors: ['bg-gradient-to-r from-yellow-400 to-yellow-600', 'bg-gray-700', 'bg-gray-600']
  }
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Choose Your Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                theme === themeOption.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTheme(themeOption.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                {themeOption.icon}
                <span className="font-medium">{themeOption.name}</span>
                {theme === themeOption.id && (
                  <Badge variant="secondary" className="ml-auto">Active</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{themeOption.description}</p>
              <div className="flex gap-2">
                {themeOption.colors.map((color, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full ${color} border border-gray-300`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
