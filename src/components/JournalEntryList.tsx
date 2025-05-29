
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
}

interface JournalEntryListProps {
  refreshTrigger?: number;
}

const JournalEntryList: React.FC<JournalEntryListProps> = ({ refreshTrigger }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journals')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user, refreshTrigger]);

  const handleDelete = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', entryId);

      if (error) {
        throw error;
      }

      setEntries(entries.filter(entry => entry.id !== entryId));
      toast({
        title: "Success",
        description: "Journal entry deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading your journal entries...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p className="mb-2">No journal entries yet</p>
            <p className="text-sm">Start writing your first entry above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Journal Entries</h2>
      {entries.map((entry) => (
        <Card key={entry.id} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(entry.created_at), 'PPP p')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(entry.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JournalEntryList;
