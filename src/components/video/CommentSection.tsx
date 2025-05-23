
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Comment, addComment, getCommentsByVideoId } from '@/models/Comment';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface CommentSectionProps {
  videoId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` },
        () => {
          loadComments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  const loadComments = async () => {
    setLoading(true);
    const fetchedComments = await getCommentsByVideoId(videoId);
    setComments(fetchedComments);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const newComment = await addComment({
        video_id: videoId,
        user_name: userName,
        content
      });
      
      if (newComment) {
        setContent('');
        toast({
          title: "Comment Added",
          description: "Your comment has been posted."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            className="w-full"
          />
        </div>
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>
      
      {loading ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(comment.user_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{comment.user_name}</h4>
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
