import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import { getComments, postComment, deleteComment, likeComment, type CommentData } from '../../../services/userService';
import '../../css/Article/CommentSection.css';

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await getComments(articleId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;
    setPosting(true);
    try {
      await postComment(articleId, newComment.trim());
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || !token) return;
    setPosting(true);
    try {
      await postComment(articleId, replyContent.trim(), parentId);
      setReplyTo(null);
      setReplyContent('');
      await fetchComments();
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!token) return;
    try {
      await likeComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Separate top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parentComment);
  const getReplies = (parentId: string) => comments.filter(c => c.parentComment === parentId);

  const renderComment = (comment: CommentData, isReply = false) => {
    const replies = getReplies(comment._id);
    const isLiked = user ? comment.likes.includes(user.id) : false;
    const isOwn = user ? comment.userId._id === user.id : false;

    return (
      <div key={comment._id} className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
        <div className="comment-avatar">
          {comment.userId.imageUrl ? (
            <img src={comment.userId.imageUrl} alt="" className="comment-avatar-img" />
          ) : (
            <div className="comment-avatar-placeholder">
              {comment.userId.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{comment.userId.name}</span>
            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="comment-content">{comment.content}</p>
          <div className="comment-footer">
            <button
              className={`comment-action-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => handleLike(comment._id)}
              disabled={!token}
            >
              <i className={`fa${isLiked ? 's' : 'r'} fa-heart`}></i>
              {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
            </button>
            {!isReply && token && (
              <button
                className="comment-action-btn"
                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
              >
                <i className="far fa-comment"></i> Reply
              </button>
            )}
            {isOwn && (
              <button className="comment-action-btn delete" onClick={() => handleDelete(comment._id)}>
                <i className="far fa-trash-alt"></i> Delete
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyTo === comment._id && (
            <div className="reply-input-box">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                maxLength={2000}
                onKeyDown={(e) => e.key === 'Enter' && handleReply(comment._id)}
              />
              <button onClick={() => handleReply(comment._id)} disabled={posting || !replyContent.trim()}>
                Reply
              </button>
            </div>
          )}

          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="replies-list">
              {replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        <i className="far fa-comments"></i> Comments ({comments.length})
      </h3>

      {/* Comment input */}
      {user ? (
        <form className="comment-form" onSubmit={handlePost}>
          <div className="comment-input-row">
            <div className="comment-avatar">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="comment-avatar-img" />
              ) : (
                <div className="comment-avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the conversation..."
              maxLength={2000}
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn" disabled={posting || !newComment.trim()}>
              {posting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>
            <Link to="/login">Login</Link> or <Link to="/signup">Sign up</Link> to join the conversation.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : topLevelComments.length > 0 ? (
        <div className="comments-list">
          {topLevelComments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="comments-empty">
          <i className="far fa-comment-dots"></i>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
