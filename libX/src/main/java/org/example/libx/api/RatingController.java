package org.example.libx.api;

import org.example.libx.service.BookService;
import org.example.libx.service.RatingService;
import org.example.libx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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



}
