package org.example.libx.api;

import org.example.libx.firebase.FirebaseStorageStrategy;
import org.example.libx.model.Book;
import org.example.libx.helpers.Criteria;
import org.example.libx.model.Image;
import org.example.libx.service.BookService;
import org.example.libx.service.ImageService;
import org.example.libx.service.RatingService;
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

import java.util.*;

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
    public ResponseEntity<Book> getBookById(@PathVariable("id") UUID id) {
        Optional<Book> bookMaybe = bookService.getBookById(id);
        if(bookMaybe.isEmpty())
            return ResponseEntity.status(NOT_FOUND).build();
        return ResponseEntity.status(OK).body(bookMaybe.get());
    }

    @GetMapping("author/{author}")
    public Set<Book> getBooksByAuthor(@PathVariable("author") String author) {
        return new HashSet<>(bookService.getBooksByAuthor(author));
    }

    @GetMapping("publisher/{publisher}")
    public Set<Book> getBooksByPublisher(@PathVariable("publisher") String publisher) {
        return new HashSet<>(bookService.getBooksByPublisher(publisher));
    }

    @GetMapping("year/{year}")
    public Set<Book> getBooksByYear(@PathVariable("year") int year) {
        return new HashSet<>(bookService.getBooksByYear(year));
    }

    @GetMapping("genre/{genre}")
    public Set<Book> getBooksByGenre(@PathVariable("genre") String genre) {
        return new HashSet<>(bookService.getBooksByGenre(genre));
    }

    @GetMapping("/search")
    public Set<Book> getBooksBySearch(@RequestParam("q") String search) {
        System.out.println();
        System.out.println();
        System.out.println("Search: " + search);
        System.out.println();
        System.out.println();
        Set<Book> bookList = new HashSet<>(bookService.getBooksBySearch(search));
        System.out.println();
        System.out.println();
        System.out.println("Book List: " + bookList.size());
        System.out.println();
        System.out.println();
        return bookList;
    }

    @GetMapping("{id}/image")
    public ResponseEntity<byte[]> getImageByBookId(@PathVariable("id") UUID id) {
        Optional<Image> image = imageService.getImageByBookId(id);

        if (image.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
        }

        try {
            String imagePath = image.get().getTitle();
            String imageType = image.get().getType();
            if (Objects.equals(imageType, "image/jpeg"))
                imageType = "image/jpg";
            imagePath = imagePath + "." + imageType.split("/")[1];
            byte[] img = firebaseStorageStrategy.download(imagePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imageType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + imagePath + "\"")
                    .body(img);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("{id}/recommendations")
    public List<Book> getRecommendedBooks(@PathVariable("id") UUID id) {
        return bookService.getRecommendedBooks(id);
    }

    @PostMapping("/criteria")
    public ResponseEntity<Set<Book>> getBooksByCriteria(@RequestBody Criteria criteria) {
        return ResponseEntity.ok(bookService.getBooksByCriteria(criteria));
    }


    @PostMapping
    public ResponseEntity<Void> addBook(@RequestBody Book book) {
        if(bookService.addBook(book) == 1) {
            bookService.updateRecommended();
            return ResponseEntity.status(CREATED).build();
        }
        return ResponseEntity.status(BAD_REQUEST).build();
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable("id") UUID id) {
        if (bookService.deleteBook(id) == 1) {
            bookService.updateRecommended();
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("{id}")
    public ResponseEntity<Void> updateBook(@PathVariable("id") UUID id, @RequestBody Book book) {
        if(bookService.updateBook(id, book) == 1){
            bookService.updateRecommended();
            return ResponseEntity.status(NO_CONTENT).build();}
        return ResponseEntity.status(NOT_FOUND).build();
    }

    @PutMapping(path = "{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadBookImage(@PathVariable("id") UUID id, @RequestParam("image") MultipartFile image) {
        if(imageService.uploadImage(id, image) == 1){
            return ResponseEntity.status(NO_CONTENT).build();
        }
        return ResponseEntity.status(NOT_ACCEPTABLE).build();
    }

    @GetMapping("authors")
    public List<String> getAuthors() {
        return bookService.getAuthors();
    }

    @GetMapping("publishers")
    public List<String> getPublishers() {
        return bookService.getPublishers();
    }

    @GetMapping("genres")
    public List<String> getGenres() {
        return bookService.getGenres();
    }

}
