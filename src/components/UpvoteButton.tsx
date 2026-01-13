import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from '@/utils/toastHelpers';

interface UpvoteButtonProps {
  reportType: 'red_flag' | 'intervention';
  reportId: string;
  initialCount?: number;
  initialUserUpvoted?: boolean;
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  reportType,
  reportId,
  initialCount = 0,
  initialUserUpvoted = false
}) => {
  const { user } = useUser();
  const [count, setCount] = useState(initialCount);
  const [userUpvoted, setUserUpvoted] = useState(initialUserUpvoted);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUpvoteData();
  }, [reportType, reportId]);

  const loadUpvoteData = async () => {
    try {
      const response = await api.getUpvotes(reportType, reportId);
      if (response.status === 200) {
        setCount(response.data.count || 0);
        setUserUpvoted(response.data.user_upvoted || false);
      }
    } catch (error) {
      console.error('Failed to load upvote data:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please log in to upvote reports');
      return;
    }

    try {
      setLoading(true);
      const response = await api.toggleUpvote(reportType, reportId);
      if (response.status === 200) {
        if (userUpvoted) {
          setCount(prev => prev - 1);
          setUserUpvoted(false);
          toast.success('Upvote removed');
        } else {
          setCount(prev => prev + 1);
          setUserUpvoted(true);
          toast.success('Report upvoted');
        }
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
      toast.error('Failed to update upvote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUpvote}
      disabled={loading}
      className={`flex items-center gap-2 ${
        userUpvoted ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : ''
      }`}
    >
      <Heart
        size={16}
        className={userUpvoted ? 'fill-current' : ''}
      />
      <span>{count}</span>
    </Button>
  );
};
