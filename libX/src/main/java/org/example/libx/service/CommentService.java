package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.model.Comment;
import org.example.libx.repository.CommentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CommentService {
    private final CommentRepo commentRepo;

    @Autowired
    public CommentService(CommentRepo commentRepo) {
        this.commentRepo = commentRepo;
    }

    public int addComment(Comment comment) {
        commentRepo.save(comment);
        return 1;
    }

    public Optional<Comment> getCommentById(UUID commentId) {
        return commentRepo.findById(commentId);
    }

    public List<Comment> getCommentsByBookId(UUID animalId) {
        return commentRepo.findAllByBookId(animalId);
    }

    public int deleteComment(UUID commentId) {
        commentRepo.deleteById(commentId);
        return 1;
    }
}
