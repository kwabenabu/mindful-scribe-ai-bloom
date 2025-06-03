
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  HelpCircle,
  BarChart3,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onShowTaskDialog: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onShowTaskDialog }) => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/journal')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-blue-600 transition-colors">
              <PlusCircle className="h-5 w-5 text-blue-500" />
              <span>New Entry</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Start writing your thoughts and experiences</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onShowTaskDialog}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-purple-600 transition-colors">
              <CheckSquare className="h-5 w-5 text-purple-500" />
              <span>Complete Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Mark your goals and tasks as complete</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/insights')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-purple-600 transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span>View Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Track your progress and analyze trends</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/calendar')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-green-600 transition-colors">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">View your entries in calendar format</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/faq')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-orange-600 transition-colors">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              <span>FAQ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Get answers to common questions</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuickActions;
