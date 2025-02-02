package org.example.libx.api;

import jakarta.servlet.http.HttpServletRequest;
import org.example.libx.model.Book;
import org.example.libx.helpers.BookId;
import org.example.libx.helpers.RegisterRequest;
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

    public User getUser(HttpServletRequest request) {
        String username = userService.getUsernameFromJwt(request);
        return userService.getUserByUsername(username);
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

    @PutMapping(path = "/updateSelf")
    public ResponseEntity<?> updateSelf(@NonNull HttpServletRequest request, @RequestBody RegisterRequest details) {
        User oldUser = getUser(request);
        if (oldUser == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        if (details.getEmail() != null)
            oldUser.setEmail(details.getEmail());
        if (details.getUsername() != null)
            oldUser.setUsername(details.getUsername());
        if (userService.updateUser(oldUser.getId(), oldUser) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("User not updated");
        return ResponseEntity.status(NO_CONTENT).body("User updated");
    }

    @GetMapping(path = "/history")
    public ResponseEntity<?> getReadBooks(@NonNull HttpServletRequest request) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(userService.getUserReadBooks(user.getId()));
    }

    @GetMapping(path = "/recs")
    public ResponseEntity<?> getRecommendations(@NonNull HttpServletRequest request) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(userService.getUserRecommendations(user.getId()));
    }

    @GetMapping(path = "/rented")
    public ResponseEntity<?> getRentedBooks(@NonNull HttpServletRequest request) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(userService.getUserRentedBooks(user.getId()));
    }

    @PostMapping(path = "/rented")
    public ResponseEntity<?> rentBook(@NonNull HttpServletRequest request, @RequestBody BookId bookId) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId.getId());
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (userService.rentBook(user.getId(), book) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("Book not rented");
        return ResponseEntity.status(CREATED).body("Book rented");
    }

    @DeleteMapping(path = "/rented/{bookId}")
    public ResponseEntity<?> returnBook(@NonNull HttpServletRequest request, @PathVariable("bookId") UUID bookId) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId);
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (userService.returnBook(user.getId(), book) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("Book not returned");
        return ResponseEntity.status(NO_CONTENT).body("Book returned");
    }

    @GetMapping(path = "/rented/{bookId}")
    public ResponseEntity<String> getRentedBook(@NonNull HttpServletRequest request, @PathVariable("bookId") UUID bookId) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        Optional<Book> bookMaybe = bookService.getBookById(bookId);
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (user.getRentedBooks().contains(book)){
            String rentedOn = userService.getRentDate(user.getId(), bookId);
            System.out.println();
            System.out.println();
            System.out.println(rentedOn);
            System.out.println();
            System.out.println();
            return ResponseEntity.status(OK).body(rentedOn);
        }
        return ResponseEntity.status(OK).body("Book is not rented");
    }

    @GetMapping(path = "/favorites")
    public ResponseEntity<?> getFavorites(@NonNull HttpServletRequest request) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");
        return ResponseEntity.status(OK).body(userService.getUserFavorites(user.getId()));
    }

    @GetMapping(path = "/favorites/{bookId}")
    public ResponseEntity<?> getFavorite(@NonNull HttpServletRequest request, @PathVariable("bookId") UUID bookId) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId);
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (user.getFavorites().contains(book))
            return ResponseEntity.status(OK).body("Book is favorite");
        return ResponseEntity.status(OK).body("Book is not a favorite");
    }


    @PostMapping(path = "/favorites")
    public ResponseEntity<?> addFavorite( HttpServletRequest request, @RequestBody BookId bookId) {
        User user = getUser(request);
        if (user == null)
            return ResponseEntity.status(NOT_FOUND).body("User not found");

        Optional<Book> bookMaybe = bookService.getBookById(bookId.getId());
        if (bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found");
        Book book = bookMaybe.get();
        if (userService.addFavorite(user.getId(), book) == 0)
            return ResponseEntity.status(NOT_ACCEPTABLE).body("Favorite not added");
        System.out.println("Favorite added");
        return ResponseEntity.status(CREATED).body("Favorite added");
    }

    @DeleteMapping(path = "/favorites/{bookId}")
    public ResponseEntity<?> deleteFavorite( HttpServletRequest request, @PathVariable("bookId") UUID bookId) {
        User user = getUser(request);
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
