package org.example.libx.api;

import jakarta.servlet.http.HttpServletRequest;
import org.example.libx.model.Book;
import org.example.libx.model.BookId;
import org.example.libx.model.User;
import org.example.libx.service.BookService;
import org.example.libx.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BookService bookService;

    public UserController(UserService userService, BookService bookService) {
        this.userService = userService;
        this.bookService = bookService;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping(path = "{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable("id") UUID id) {
        if (userService.deleteUser(id) == 0)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(NO_CONTENT).body("User deleted");
    }

    @DeleteMapping(path = "/deleteSelf")
    public ResponseEntity<?> deleteSelf(@NonNull HttpServletRequest request) {
        String username = userService.getUsernameFromJwt(request);
        UUID id = userService.getUserByUsername(username).getId();
        if (userService.deleteUser(id) == 0)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(NO_CONTENT).body("User deleted");
    }

    @GetMapping(path = "/self")
    public ResponseEntity<?> getSelf(@NonNull HttpServletRequest request) {
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(user);
    }

    @PatchMapping(path = "/updateSelf")
    public ResponseEntity<?> updateSelf(@NonNull HttpServletRequest request, @RequestBody User user) {
        String username = userService.getUsernameFromJwt(request);
        User oldUser = userService.getUserByUsername(username);
        if (oldUser == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        if (user.getEmail() != null)
            oldUser.setEmail(user.getEmail());
        if (user.getUsername() != null)
            oldUser.setUsername(user.getUsername());
        if (userService.updateUser(oldUser.getId(), oldUser) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("User not updated");
        return ResponseEntity.status(NO_CONTENT).body("User updated");
    }

    @GetMapping(path = "/favorites")
    public ResponseEntity<?> getFavorites(@NonNull HttpServletRequest request) {
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(user.getFavorites());
    }

    @PostMapping(path = "/favorites")
    public ResponseEntity<?> addFavorite(@NonNull HttpServletRequest request, @RequestBody BookId bookId) {
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId.getId());
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (userService.addFavorite(user.getId(), book) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("Favorite not added");
        return ResponseEntity.status(CREATED).body("Favorite added");
    }

    @DeleteMapping(path = "/favorites/{bookId}")
    public ResponseEntity<?> deleteFavorite(@NonNull HttpServletRequest request, @PathVariable("bookId") UUID bookId) {
        String username = userService.getUsernameFromJwt(request);
        User user = userService.getUserByUsername(username);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId);
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (userService.removeFavorite(user.getId(), book) == 1)
            return ResponseEntity.status(NO_CONTENT).body("Favorite deleted");
        return ResponseEntity.status(BAD_REQUEST).body("Bad request");
    }
}
