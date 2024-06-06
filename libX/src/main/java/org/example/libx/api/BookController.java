package org.example.libx.api;

import org.example.libx.firebase.FirebaseStorageStrategy;
import org.example.libx.model.Book;
import org.example.libx.model.Criteria;
import org.example.libx.model.Image;
import org.example.libx.service.BookService;
import org.example.libx.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final ImageService imageService;
    private final FirebaseStorageStrategy firebaseStorageStrategy;

    @Autowired
    public BookController(BookService bookService, ImageService imageService, FirebaseStorageStrategy firebaseStorageStrategy) {
        this.bookService = bookService;
        this.imageService = imageService;
        this.firebaseStorageStrategy = firebaseStorageStrategy;
    }

    @GetMapping
    public List<Book> getBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getBookById(@PathVariable("id") UUID id) {
        Optional<Book> bookMaybe = bookService.getBookById(id);
        if(bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).body("Book not found.".getBytes());
        Book book = bookMaybe.get();
        System.out.println(book);
        return ResponseEntity.status(OK).body(book);
    }

    @GetMapping("author/{author}")
    public List<Book> getBooksByAuthor(@PathVariable("author") String author) {
        return bookService.getBooksByAuthor(author);
    }

    @GetMapping("publisher/{publisher}")
    public List<Book> getBooksByPublisher(@PathVariable("publisher") String publisher) {
        return bookService.getBooksByPublisher(publisher);
    }

    @GetMapping("year/{year}")
    public List<Book> getBooksByYear(@PathVariable("year") int year) {
        return bookService.getBooksByYear(year);
    }

    @GetMapping("genre/{genre}")
    public List<Book> getBooksByGenre(@PathVariable("genre") String genre) {
        return bookService.getBooksByGenre(genre);
    }

    @GetMapping("/search")
    public List<Book> getBooksBySearch(@RequestParam("q") String search) {
        System.out.println("Searching for books with: " + search);
        return bookService.getBooksBySearch(search);
    }

    @GetMapping("{id}/image")
    public ResponseEntity<byte[]> getImageByBookId(@PathVariable("id") UUID id) {
        System.out.println("Fetching image for book ID: " + id);
        Optional<Image> image = imageService.getImageByBookId(id);

        if (image.isEmpty()) {
            System.out.println("Image not found in database for book ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Image not found.".getBytes());
        }

        try {
            String imagePath = image.get().getTitle();
            String imageType = image.get().getType();
            if (Objects.equals(imageType, "image/jpeg"))
                imageType = "image/jpg";
            imagePath = imagePath + "." + imageType.split("/")[1];
            byte[] img = firebaseStorageStrategy.download(imagePath);
            System.out.println("Image downloaded successfully, size: " + img.length + " bytes");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imageType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + imagePath + "\"")
                    .body(img);
        } catch (Exception e) {
            System.out.println("Error occurred while fetching the image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image not found.".getBytes());
        }
    }

    @GetMapping("{id}/recommendations")
    public List<Book> getRecommendedBooks(@PathVariable("id") UUID id) {
        return bookService.getRecommendedBooks(id);
    }

    @PostMapping("criteria")
    public List<Book> getBooksByCriteria(@RequestBody Criteria criteria) {
        return bookService.getBooksByCriteria(criteria);
    }

    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        if(bookService.addBook(book) == 1) {
            bookService.updateRecommended();
            return ResponseEntity.status(CREATED).body("Book added successfully.".getBytes());
        }
        return ResponseEntity.status(BAD_REQUEST).body("Book already exists or is invalid.".getBytes());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteBook(@PathVariable("id") UUID id) {
        if(bookService.deleteBook(id) == 1) {
            bookService.updateRecommended();
            return ResponseEntity.status(NO_CONTENT).body("Book deleted successfully.".getBytes());
        }
        return ResponseEntity.status(NOT_FOUND).body("Book not found.".getBytes());
    }

    @PutMapping("{id}")
    public ResponseEntity<?> updateBook(@PathVariable("id") UUID id, @RequestBody Book book) {
        if(bookService.updateBook(id, book) == 1){
            bookService.updateRecommended();
            return ResponseEntity.status(NO_CONTENT).body("Book updated successfully.".getBytes());}
        return ResponseEntity.status(NOT_FOUND).body("Book not found.".getBytes());
    }

    @PutMapping(path = "{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> uploadBookImage(@PathVariable("id") UUID id, @RequestParam("image") MultipartFile image) {
        if(imageService.uploadImage(id, image) == 1){
            return ResponseEntity.status(NO_CONTENT).body("Image uploaded successfully.".getBytes());
        }
        return ResponseEntity.status(NOT_ACCEPTABLE).body("Image is invalid.".getBytes());
    }


}
