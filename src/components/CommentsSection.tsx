import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Send } from 'lucide-react';
import { toast } from '@/utils/toastHelpers';

interface Comment {
  id: number;
  user_id: number;
  report_type: string;
  report_id: number;
  comment_text: string;
  comment_type: 'user' | 'admin' | 'official';
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

interface CommentsSectionProps {
  reportType: 'red_flag' | 'intervention';
  reportId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ reportType, reportId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOfficialResponse, setIsOfficialResponse] = useState(false);

  useEffect(() => {
    loadComments();
  }, [reportType, reportId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await api.getComments(reportType, reportId);
      if (response.status === 200) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData = {
        comment_text: newComment.trim(),
        comment_type: isOfficialResponse ? 'official' : undefined
      };
      const response = await api.addComment(reportType, reportId, commentData);
      if (response.status === 201) {
        setComments(prev => [...prev, response.data]);
        setNewComment('');
        setIsOfficialResponse(false);
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await api.deleteComment(commentId.toString());
      if (response.status === 200) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Comment deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Community Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Section */}
        {user && (
          <div className="space-y-2">
            {user.is_admin && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isOfficialResponse}
                    onChange={(e) => setIsOfficialResponse(e.target.checked)}
                    className="rounded"
                  />
                  Post as Official Response
                </label>
              </div>
            )}
            <Textarea
              placeholder={isOfficialResponse ? "Post an official response..." : "Share your thoughts about this report..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2"
              >
                <Send size={16} />
                {submitting ? 'Posting...' : (isOfficialResponse ? 'Post Official Response' : 'Post Comment')}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No comments yet. Be the first to share your thoughts in the way you think!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg border">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={comment.profile_picture ?
                      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${comment.profile_picture}` :
                      undefined
                    }
                    alt={`${comment.first_name || 'Unknown'} ${comment.last_name || 'User'}`}
                  />
                  <AvatarFallback>
                    {(comment.first_name?.[0] || '?')}{(comment.last_name?.[0] || '?')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">
                        {comment.first_name || 'Unknown'} {comment.last_name || 'User'}
                      </div>
                      {comment.comment_type === 'admin' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Admin
                        </span>
                      )}
                      {comment.comment_type === 'official' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Official Response
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      {(user?.id === String(comment.user_id) || user?.is_admin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
