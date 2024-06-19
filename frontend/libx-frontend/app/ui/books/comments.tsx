'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button} from '@/components/ui/button'; // Ensure this import path is correct
import { Textarea } from '@/components/ui/textarea'; // Ensure this import path is correct
import { getComments, addComment } from '@/api/get-individual-book'; // Ensure correct import paths

export interface Comments {
    content: string;
    username: string;
    createdAt: string;
}

export interface CommentText {
    content: string;
}

interface CommentsSectionProps {
    postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
    const [comments, setComments] = useState<Comments[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchInitialComments = async () => {
            setLoading(true);
            try {
                const fetchedComments = await getComments(postId);
                console.log(fetchedComments);
                for (let i = 0; i < fetchedComments.length; i++) {
                    fetchedComments[i].createdAt = fetchedComments[i].createdAt.split('T')[0];
                }
                setComments(fetchedComments);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
                setLoading(false);
            }
        };

        fetchInitialComments();
    }, [postId]);

    const handleNewCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (newComment.trim()) {
            try {
                await addComment(postId, { content: newComment });
                window.location.reload(); 
            } catch (error) {
                console.error('Error submitting comment:', error);
            }
        }
    };

    return (
        <div>
            {comments.map((comment, index: number) => (
                <div key={index}>
                    <p>Date: {comment.createdAt.replace('T', ' ').split('.')[0]}</p>
                    <p><strong>{comment.username} :</strong> {comment.content}</p>
                </div>
            ))}
            {loading && <p>Loading comments...</p>}
            <Textarea
                value={newComment}
                onChange={handleNewCommentChange}
                placeholder="Write a comment..."
            />
            <Button className = "mt-6"onClick={handleCommentSubmit}>Post Comment</Button>
        </div>
    );
};

export default CommentsSection;
