package org.example.libx.repository;

import org.example.libx.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepo extends JpaRepository<Comment, UUID>{
    List<Comment> findAllByBookId(UUID bookId);
    void deleteAllByBookId(UUID bookId);

}
