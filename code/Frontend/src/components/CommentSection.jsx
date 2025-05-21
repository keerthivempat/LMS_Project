import React, { useState, useEffect } from 'react';
import { getAvatarUrl, getInitials, getColorForName } from '../constants/avatars';

const CommentSection = ({ sectionId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [error, setError] = useState(null);
    const [likingComments, setLikingComments] = useState({}); // Track loading state for each comment's like button
    const [likingReplies, setLikingReplies] = useState({}); // Track loading state for each reply's like button
    const [replyForms, setReplyForms] = useState({}); // Track which comments have reply forms open
    const [replyTexts, setReplyTexts] = useState({}); // Store reply text for each comment
    const [submittingReplies, setSubmittingReplies] = useState({}); // Track loading state for reply submissions

    // Fetch comments
    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Please login to view comments');
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/comments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setComments(data.data);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to fetch comments. Please try again.');
        }
    };

    // Add new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Please login to post comments');
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text: newComment }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setShowComments(true);
                await fetchComments();
                setNewComment('');
                setError(null);
            } else {
                setError(data.message || 'Failed to post comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Failed to post comment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add like comment function
    const handleLikeComment = async (commentId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Please login to like comments');
                return;
            }

            // Set loading state for this specific comment
            setLikingComments(prev => ({ ...prev, [commentId]: true }));

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/comments/${commentId}/like`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Update the comments state to reflect the new like count
                setComments(prevComments => 
                    prevComments.map(comment => 
                        comment._id === commentId
                            ? {
                                ...comment,
                                likes: data.data.likes,
                                isLiked: data.data.liked
                            }
                            : comment
                    )
                );
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            setError('Failed to like comment. Please try again.');
        } finally {
            // Clear loading state for this comment
            setLikingComments(prev => ({ ...prev, [commentId]: false }));
        }
    };
     // Toggle reply form for a comment
     const toggleReplyForm = (commentId) => {
        setReplyForms(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));

        // Initialize reply text if not already set
        if (!replyTexts[commentId]) {
            setReplyTexts(prev => ({
                ...prev,
                [commentId]: ''
            }));
        }
    };

    // Handle reply text change
    const handleReplyTextChange = (commentId, text) => {
        setReplyTexts(prev => ({
            ...prev,
            [commentId]: text
        }));
    };

    // Submit reply to a comment
    const handleSubmitReply = async (commentId) => {
        console.log("Submitting reply for comment:", commentId);
        const replyText = replyTexts[commentId];
        if (!replyText || !replyText.trim()) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Please login to reply to comments');
                return;
            }

            // Set loading state for this specific reply submission
            setSubmittingReplies(prev => ({ ...prev, [commentId]: true }));

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/comments/${commentId}/reply`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ text: replyText }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('comment data is',data);
            if (data.success) {
                // Clear reply text and close form
                setReplyTexts(prev => ({
                    ...prev,
                    [commentId]: ''
                }));
                setReplyForms(prev => ({
                    ...prev,
                    [commentId]: false
                }));

                // Refresh comments to show the new reply
                await fetchComments();
            } else {
                setError(data.message || 'Failed to post reply');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            setError('Failed to post reply. Please try again.');
        } finally {
            // Clear loading state
            setSubmittingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    // Like a reply
    const handleLikeReply = async (commentId, replyId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Please login to like replies');
                return;
            }

            // Create a unique key for tracking this specific reply's loading state
            const likeKey = `${commentId}-${replyId}`;
            setLikingReplies(prev => ({ ...prev, [likeKey]: true }));

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/comments/${commentId}/replies/${replyId}/like`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Update comments state to reflect the new like status
                setComments(prevComments => 
                    prevComments.map(comment => {
                        if (comment._id === commentId) {
                            return {
                                ...comment,
                                replies: comment.replies.map(reply => 
                                    reply._id === replyId
                                        ? {
                                            ...reply,
                                            likes: data.data.likes,
                                            isLiked: data.data.liked
                                        }
                                        : reply
                                )
                            };
                        }
                        return comment;
                    })
                );
            }
        } catch (error) {
            console.error('Error liking reply:', error);
            setError('Failed to like reply. Please try again.');
        } finally {
            // Clear loading state
            const likeKey = `${commentId}-${replyId}`;
            setLikingReplies(prev => ({ ...prev, [likeKey]: false }));
        }
    };

    // Add a utility function to get avatar URL for a user
    const getUserAvatar = (user) => {
        if (!user) return null;
        
        if (user.hasCustomAvatar) {
            // Use custom avatar from our predefined list
            return getAvatarUrl({ 
                hasCustomAvatar: true, 
                avatarIndex: user.avatarIndex, 
                name: user.name 
            });
        } else {
            // Use initials-based avatar
            return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=${getColorForName(user.name)}&color=fff&size=200&bold=true&format=png`;
        }
    };

    // Handle avatar load errors
    const handleAvatarError = (e, name) => {
        e.target.src = `https://ui-avatars.com/api/?name=${getInitials(name || 'U')}&background=random&color=fff&size=64&bold=true`;
    };

    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments, sectionId]);

    return (
        <div className="mt-4">
            {/* Comments Button */}
            <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-blue-500 hover:underline mb-4"
                style={{ color: colorScheme.brown }}
            >
                <span>Comments {comments.length > 0 && `(${comments.length})`}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className={`transform transition-transform duration-300 ${showComments ? 'rotate-180' : ''}`}
                >
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
            </button>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.brown }}>
                        Comments
                    </h3>

                    {/* Comment Form */}
                    <div className="mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-4 border-2 rounded border-brown resize-none focus:outline-none text-brown bg-white focus:outline-none focus:border-yellow"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={isLoading || !newComment.trim()}
                            className="mt-2 px-6 py-2 rounded text-white transition-all duration-300"
                            style={{ 
                                backgroundColor: colorScheme.brown,
                                opacity: (isLoading || !newComment.trim()) ? 0.5 : 1
                            }}
                        >
                            {isLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div 
                                key={comment._id}
                                className="p-4 rounded"
                                style={{ backgroundColor: 'white', border: `1px solid ${colorScheme.brown}` }}
                            >
                                <div className="flex items-start mb-2">
                                    {/* Add avatar here */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                        <img 
                                            src={getUserAvatar(comment.user)}
                                            alt={`${comment.user?.name || 'Anonymous'}'s avatar`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => handleAvatarError(e, comment.user?.name)}
                                        />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold" style={{ color: colorScheme.brown }}>
                                                {comment.user?.name || 'Anonymous'}
                                            </span>
                                            <span className="text-gray-600 text-sm">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ color: colorScheme.brown }} className="mb-2">
                                            {comment.text}
                                        </p>
                                        
                                        {/* Like Button and Count */}
                                        <div className="flex items-center gap-4 mt-2">
                                            <button
                                                onClick={() => handleLikeComment(comment._id)}
                                                disabled={likingComments[comment._id]}
                                                className="flex items-center gap-2 text-sm px-3 py-1 rounded transition-all duration-300"
                                                style={{ 
                                                    backgroundColor: comment.isLiked ? colorScheme.brown : 'transparent',
                                                    color: comment.isLiked ? 'white' : colorScheme.brown,
                                                    border: `1px solid ${colorScheme.brown}`,
                                                    opacity: likingComments[comment._id] ? 0.5 : 1
                                                }}
                                            >
                                                {/* Thumbs Up Icon */}
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    width="16" 
                                                    height="16" 
                                                    fill="currentColor" 
                                                    viewBox="0 0 16 16"
                                                    className="transition-transform duration-300 hover:scale-110"
                                                >
                                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                                </svg>
                                                <span>{comment.likes || 0}</span>
                                            </button>
                                            
                                            {/* Reply Button */}
                                            <button
                                                onClick={() => toggleReplyForm(comment._id)}
                                                className="flex items-center gap-1 text-sm text-brown hover:underline"
                                                style={{ color: colorScheme.brown }}
                                            >
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    width="16" 
                                                    height="16" 
                                                    fill="currentColor" 
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                                                </svg>
                                                Reply
                                            </button>
                                        </div>
                                        
                                        {/* Reply Form */}
                                        {replyForms[comment._id] && (
                                            <div className="mt-3">
                                                <textarea
                                                    value={replyTexts[comment._id] || ''}
                                                    onChange={(e) => handleReplyTextChange(comment._id, e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className="w-full p-3 border rounded border-brown resize-none focus:outline-none text-brown bg-white focus:border-yellow text-sm"
                                                    rows="2"
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => toggleReplyForm(comment._id)}
                                                        className="px-3 py-1 text-sm rounded"
                                                        style={{ color: colorScheme.brown }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmitReply(comment._id)}
                                                        disabled={submittingReplies[comment._id] || !replyTexts[comment._id]?.trim()}
                                                        className="px-3 py-1 text-sm rounded text-white transition-all duration-300"
                                                        style={{ 
                                                            backgroundColor: colorScheme.brown,
                                                            opacity: (submittingReplies[comment._id] || !replyTexts[comment._id]?.trim()) ? 0.5 : 1
                                                        }}
                                                    >
                                                        {submittingReplies[comment._id] ? 'Posting...' : 'Post Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Replies Section */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-4 pl-6 border-l-2 space-y-4" style={{ borderColor: colorScheme.yellow }}>
                                                <h4 className="text-sm font-medium" style={{ color: colorScheme.brown }}>
                                                    {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                                </h4>
                                                
                                                {comment.replies.map((reply) => (
                                                    <div key={reply._id} className="flex items-start">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                                                            <img 
                                                                src={getUserAvatar(reply.user)}
                                                                alt={`${reply.user?.name || 'Anonymous'}'s avatar`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => handleAvatarError(e, reply.user?.name)}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-medium text-sm" style={{ color: colorScheme.brown }}>
                                                                    {reply.user?.name || 'Anonymous'}
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm" style={{ color: colorScheme.brown }}>
                                                                {reply.text}
                                                            </p>
                                                            
                                                            {/* Reply Like Button */}
                                                            <button
                                                                onClick={() => handleLikeReply(comment._id, reply._id)}
                                                                disabled={likingReplies[`${comment._id}-${reply._id}`]}
                                                                className="flex items-center gap-1 text-xs mt-1 px-2 py-1 rounded transition-all duration-300"
                                                                style={{ 
                                                                    backgroundColor: reply.isLiked ? colorScheme.yellow : 'transparent',
                                                                    color: reply.isLiked ? colorScheme.brown : colorScheme.brown,
                                                                    border: `1px solid ${colorScheme.yellow}`,
                                                                    opacity: likingReplies[`${comment._id}-${reply._id}`] ? 0.5 : 1
                                                                }}
                                                            >
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    width="12" 
                                                                    height="12" 
                                                                    fill="currentColor" 
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                                                </svg>
                                                                <span>{reply.likes || 0}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
};

export default CommentSection;
