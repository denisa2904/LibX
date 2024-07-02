'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button'; // Ensure this import path is correct
import { Textarea } from '@/components/ui/textarea'; // Ensure correct import paths
import { getComments, addComment } from '@/api/get-individual-book'; // Ensure correct import paths
import { getUser } from '@/api/user';
import { set } from 'react-hook-form';

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
    isAuth: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, isAuth }) => {
    const [comments, setComments] = useState<Comments[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");

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

    useEffect(() => {
        getUser().then((data) => {
            if (!data) {
                return;
            }
            setUsername(data.username);
        });
        
    }, []);

    const handleNewCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (newComment.trim()) {
            try {
                const addedComment = await addComment(postId, { content: newComment });
                setComments((prevComments) => [
                    ...prevComments,
                    {
                        content: newComment,
                        username: username, 
                        createdAt: new Date().toISOString().split('T')[0],
                    },
                ]);
                setNewComment("");
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
            {isAuth && (
                <div>
                    <div style={{ height: '10px' }} />
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={handleNewCommentChange}
                    />
                    <div style={{ height: '10px' }} />
                    <Button onClick={handleCommentSubmit}>Submit</Button>
                </div>
            )}
        </div>
    );
};

export default CommentsSection;
