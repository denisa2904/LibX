package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.model.Book;
import org.example.libx.model.Criteria;
import org.example.libx.model.Genre;
import org.example.libx.model.User;
import org.example.libx.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Transactional
public class BookService {
    private final BookRepo bookRepo;
    private final CommentRepo commentRepo;

    private final ImageService imageService;
    private final RatingRepo ratingRepo;
    private final UserRepo userRepo;

    private final GenreRepo genreRepo;

    @Autowired
    private RestTemplate restTemplate;


    @Autowired
    public BookService(BookRepo bookRepo, CommentRepo commentRepo, RatingRepo ratingRepo, UserRepo userRepo, GenreRepo genreRepo, ImageService imageService) {
        this.bookRepo = bookRepo;
        this.commentRepo = commentRepo;
        this.ratingRepo = ratingRepo;
        this.userRepo = userRepo;
        this.genreRepo = genreRepo;
        this.imageService = imageService;
    }

    public boolean validateNewBook(Book book) {
        if(book.getTitle().isEmpty())
            return false;
        List<Book> books = bookRepo.findAll();
        for(Book b : books) {
            if(b.getTitle().equals(book.getTitle()))
                return false;
        }
        return true;
    }

    public int addBook(Book book) {
        if(validateNewBook(book)) {
            List<Genre> genres = new ArrayList<>();
            for (Genre genre : book.getGenres()) {
                Optional<Genre> genreOptional = genreRepo.findGenreByTitle(genre.getTitle());
                if (genreOptional.isEmpty()) {
                    genreRepo.save(genre);
                    genres.add(genre);
                } else {
                    genres.add(genreOptional.get());
                }
            }
            book.setGenres(genres);
            bookRepo.save(book);
            return 1;
        }
        return 0;
    }

    public void updateRecommended(){
        Book book = new Book();
        String url = "http://localhost:8000/add_book/";
        ResponseEntity<String> response = restTemplate.postForEntity(url, book, String.class);
    }

    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }

    public List<Book> getBooksByAuthor(String author) {
        return bookRepo.findAllByAuthorContaining(author);
    }

    public Optional<Book> getBookById(UUID id) {

        return bookRepo.findById(id);
    }

    public List<Book> getBooksByPublisher(String publisher) {
        return bookRepo.findAllByPublisherContaining(publisher);
    }

    public List<Book> getBooksByYear(int year) {
        return bookRepo.findAllByYear(year);
    }

    public List<Book> getBooksByGenre(String genre) {
        if(genre.contains("_"))
            genre = genre.replace("_", " ");
        List<Genre> genres = genreRepo.findAllByTitleContaining(genre);
        System.out.println();
        System.out.println();
        System.out.println(genres);
        System.out.println();
        System.out.println();
        if(genres.isEmpty()) {
            Optional<Genre> genreOptional = genreRepo.findGenreByTitle(genre);
            if(genreOptional.isEmpty())
                return new ArrayList<>();
            genres.add(genreOptional.get());
        }
        List<Book> books = new ArrayList<>();
        for( Genre g : genres)
            books.addAll(bookRepo.findAllByGenres(Collections.singletonList(g)));
        return books;
    }
    public List<Book> getBooksByRating(float rating) {
        return bookRepo.findAllByRating(rating);
    }

    public List<Book> getRecommendedBooks(UUID id) {
        Optional<Book> book = bookRepo.findById(id);
        if(book.isEmpty())
            return new ArrayList<>();
        return book.get().getRecommendations();
    }

    public List<Book> getBooksBySearch(String search){
        List<Book> books = new ArrayList<>();
        books.addAll(bookRepo.findAllByTitleContaining(search));
        books.addAll(bookRepo.findAllByAuthorContaining(search));
        books.addAll(bookRepo.findAllByPublisherContaining(search));
        books.addAll(bookRepo.findAllByDescriptionContaining(search));
        try {
            int year = Integer.parseInt(search);
            books.addAll(bookRepo.findAllByYear(year));
        } catch (NumberFormatException ignored) {
        }
        return books;
    }
    /*
    this is the body for criteria:
    {
    "criteria": {
            "author":["Tolstoy"],
            "year":["2021"],
            "genres":["Fiction"]
        }
}
    * */
    public Set<Book> getBooksByCriteria(Criteria criteria){
        Set<Book> books = new HashSet<>();
        Map<String, List<String>> criteriaMap;
        criteriaMap = criteria.getCriteria();
        for(Map.Entry<String, List<String>> entry : criteriaMap.entrySet()){
            switch (entry.getKey()) {
                case "author" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String author : entry.getValue())
                        tempBooks.addAll(bookRepo.findAllByAuthorContaining(author));
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
                case "title" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String title : entry.getValue())
                        tempBooks.addAll(bookRepo.findAllByTitleContaining(title));
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
                case "publisher" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String publisher : entry.getValue())
                        tempBooks.addAll(bookRepo.findAllByPublisherContaining(publisher));
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
                case "year" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String year : entry.getValue()){
                        int year_int = Integer.parseInt(year);
                        tempBooks.addAll(bookRepo.findAllByYear(year_int));}
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
                case "genres" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String genre : entry.getValue())
                        tempBooks.addAll(getBooksByGenre(genre));
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
                case "rating" -> {
                    Set<Book> tempBooks = new HashSet<>();
                    for (String rating : entry.getValue()) {
                        float r = Float.parseFloat(rating);
                        tempBooks.addAll(bookRepo.findAllByRating(r));
                    }
                    if (books.isEmpty())
                        books.addAll(tempBooks);
                    else
                        books.retainAll(tempBooks);
                }
            }
        }
        return books;
    }

    public int updateBook(UUID id, Book book) {
        List<Genre> genres = book.getGenres();
        Optional<Book> oldBook = bookRepo.findById(id);
        if (oldBook.isEmpty())
            return 0;

        Book updatedBook = oldBook.get();
        updatedBook.setTitle(book.getTitle());
        updatedBook.setAuthor(book.getAuthor());
        updatedBook.setPublisher(book.getPublisher());
        updatedBook.setYear(book.getYear());
        updatedBook.setRating(book.getRating());
        updatedBook.setDescription(book.getDescription());
        List<Genre> managedGenres = new ArrayList<>();
        for (Genre genre : genres) {
            Optional<Genre> genreOptional = genreRepo.findGenreByTitle(genre.getTitle());
            if (genreOptional.isEmpty()) {
                genre = genreRepo.save(genre);
            } else {
                genre = genreOptional.get();
            }
            managedGenres.add(genre);
        }
        updatedBook.setGenres(managedGenres);

        bookRepo.save(updatedBook);
        return 1;
    }

    public int deleteBook(UUID id) {
        try {
            Optional<Book> bookOptional = bookRepo.findById(id);
            if (bookOptional.isEmpty()) {
                return 0;
            }
            Book book = bookOptional.get();

            List<User> users = userRepo.findAll();
            for (User user : users) {
                user.getFavorites().remove(book);
                user.getRentedBooks().remove(book);
                userRepo.save(user);
            }

            commentRepo.deleteAllByBookId(book.getId());
            if (book.getImage() != null) {
                imageService.deleteImage(book.getImage().getId());
            }
            ratingRepo.deleteAllByBookId(book.getId());


            bookRepo.deleteAllRecommendationsInvolvingBookId(book.getId());

            bookRepo.deleteById(id);

            if (bookRepo.findById(id).isPresent()) {
                return 0;
            }
        } catch (Exception e) {
            return 0;
        }
        return 1;
    }

    public List<String> getGenres() {
        List<Genre> genres = genreRepo.findAll();
        List<String> genreTitles = new ArrayList<>();
        for (Genre genre : genres)
        {
            genreTitles.add(genre.getTitle());
        }
        return genreTitles;
    }

    public List<String> getAuthors() {
        List<Book> books = bookRepo.findAll();
        Set<String> authors = new HashSet<>();
        for (Book book : books)
            if(bookRepo.findAllByAuthor(book.getAuthor()).size() > 5){
            authors.add(book.getAuthor());
        }
        return new ArrayList<>(authors);
    }

    public List<String> getPublishers() {
        List<Book> books = bookRepo.findAll();
        Set<String> publishers = new HashSet<>();
        for (Book book : books)
            if(bookRepo.findAllByPublisher(book.getPublisher()).size() > 5){
            publishers.add(book.getPublisher());
        }
        return new ArrayList<>(publishers);
    }
}
