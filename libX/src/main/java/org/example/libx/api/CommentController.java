package org.example.libx.api;

import jakarta.servlet.http.HttpServletRequest;
import lombok.NonNull;
import org.example.libx.model.*;
import org.example.libx.service.BookService;
import org.example.libx.service.CommentService;
import org.example.libx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping(path = "api/books")
public class CommentController {

    public final CommentService commentService;
    public final BookService bookService;
    public final UserService userService;

    @Autowired
    public CommentController(CommentService service, BookService bookService, UserService userService) {
        this.commentService = service;
        this.bookService = bookService;
        this.userService = userService;
    }

    @GetMapping("{id}/comments")
    public List<CommentResponse> getCommentsByBookId(@PathVariable("id") UUID id) {
        List<Comment> comments = commentService.getCommentsByBookId(id);
        List<CommentResponse> response = new ArrayList<>();
        for(Comment com: comments) {
            User user = com.getUser();
            response.add(new CommentResponse(com.getContent(), user.getUsername(), com.getCreatedAt()));
        }
        return response;
    }

    @PostMapping("{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable("id") UUID id,
                                        @RequestBody CommentHelper commentHelper,
                                        @NonNull HttpServletRequest request){
        Optional<Book> bookMaybe = bookService.getBookById(id);
        if(bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found.");
        Book book = bookMaybe.get();
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);

        Comment comment = new Comment();
        comment.setContent(commentHelper.getContent());
        comment.setUser(user);
        comment.setBook(book);
        comment.setCreatedAt(LocalDateTime.now());
        if(commentService.addComment(comment) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("Comment not added.");
        return ResponseEntity.status(CREATED).body("Comment added successfully.");
    }

    @DeleteMapping("{id}/comments/{commentId}")
    public ResponseEntity<byte[]> deleteMyComment(@PathVariable("id") UUID id,
                                                  @PathVariable("commentId") UUID commentId,
                                                  @NonNull HttpServletRequest request) {
        Optional<Book> bookMaybe = bookService.getBookById(id);
        if(bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found.".getBytes());
        Book book = bookMaybe.get();
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        Optional<Comment> commentMaybe = commentService.getCommentById(commentId);
        Comment comment;
        if(commentMaybe.isPresent())
            comment = commentMaybe.get();
        else
            return ResponseEntity.status(NOT_FOUND).body("Comment not found.".getBytes());
        comment.setUser(user);
        comment.setBook(book);
        if(commentService.deleteComment(commentId) == 0)
            return ResponseEntity.status(NOT_FOUND).body("Comment not found.".getBytes());
        return ResponseEntity.status(NO_CONTENT).body("Comment deleted successfully.".getBytes());
    }















}
