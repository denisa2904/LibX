package org.example.libx.api;

import jakarta.servlet.http.HttpServletRequest;
import lombok.NonNull;
import org.example.libx.helpers.RatingHelper;
import org.example.libx.helpers.RatingResponse;
import org.example.libx.model.*;
import org.example.libx.service.BookService;
import org.example.libx.service.RatingService;
import org.example.libx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping(path = "api/books")
public class RatingController {
    private final RatingService ratingService;
    private final BookService bookService;
    private final UserService userService;

    @Autowired
    public RatingController(RatingService ratingService, BookService bookService, UserService userService) {
        this.ratingService = ratingService;
        this.bookService = bookService;
        this.userService = userService;
    }

    @GetMapping("{id}/rating")
    public ResponseEntity<RatingResponse> getRatingByBookId(@PathVariable("id") UUID id) {
         return ResponseEntity.ok(ratingService.getAverageRating(id));
    }

    @GetMapping("{id}/rating/user")
    public ResponseEntity<?> getRatingByBookIdAndUserId(@PathVariable("id") UUID id, @NonNull HttpServletRequest request) {
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        Optional<Book> book = bookService.getBookById(id);
        if(book.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UUID userId = user.getId();
        return ResponseEntity.ok(ratingService.getRatingByBookIdAndUserId(id, userId));
    }

    @PostMapping("{id}/rating/user")
    public ResponseEntity<?> addRating(@PathVariable("id") UUID id, @RequestBody RatingHelper rating, @NonNull HttpServletRequest request) {
        Rating r = new Rating();
        Optional<Book> book = bookService.getBookById(id);
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        if (book.isEmpty()) {
            return ResponseEntity.status(NOT_ACCEPTABLE).build();
        }
        r.setBook(book.get());
        r.setUser(user);
        r.setValue(rating.getValue());
        UUID userId = user.getId();
        if(ratingService.getRatingByBookIdAndUserId(id, userId) == 0) {
            ratingService.addRating(r);
            return ResponseEntity.status(CREATED).build();
        }
        else {
            ratingService.updateRating(r);
            return ResponseEntity.status(NO_CONTENT).build();
        }
    }

}
