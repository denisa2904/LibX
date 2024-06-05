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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

@Service
@Transactional
public class BookService {
    private final BookRepo bookRepo;
    private final CommentRepo commentRepo;
    private final ImageRepo imageRepo;
    private final RatingRepo ratingRepo;
    private final UserRepo userRepo;

    private final GenreRepo genreRepo;

    @Autowired
    private RestTemplate restTemplate;


    @Autowired
    public BookService(BookRepo bookRepo, CommentRepo commentRepo, ImageRepo imageRepo, RatingRepo ratingRepo, UserRepo userRepo, GenreRepo genreRepo) {
        this.bookRepo = bookRepo;
        this.commentRepo = commentRepo;
        this.imageRepo = imageRepo;
        this.ratingRepo = ratingRepo;
        this.userRepo = userRepo;
        this.genreRepo = genreRepo;
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

    public int updateRecommended(){
        Book book = new Book();
        String url = "http://localhost:8000/add_book/";
        ResponseEntity<String> response = restTemplate.postForEntity(url, book, String.class);
        return 1;
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

    public Optional<Book> getBookByTitle(String title) {
        return bookRepo.findBookByTitle(title);
    }

    public List<Book> getBooksByPublisher(String publisher) {
        return bookRepo.findAllByPublisherContaining(publisher);
    }

    public List<Book> getBooksByYear(int year) {
        return bookRepo.findAllByYear(year);
    }

    public List<Book> getBooksByGenre(String genre) {
        List<Genre> genres = new ArrayList<>();
        Genre g = new Genre(genre);
        genres.add(g);
        return bookRepo.findAllByGenres(genres);
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
        // if year is a number, convert to int and search by year
        try {
            int year = Integer.parseInt(search);
            books.addAll(bookRepo.findAllByYear(year));
        } catch (NumberFormatException e) {
            // do nothing
        }
        return books;
    }
    public List<Book> getBooksByCriteria(Criteria criteria){
        List<Book> books = new ArrayList<>();
        Map<String, List<String>> criteriaMap = new HashMap<>();
        System.out.println(criteria);
        criteriaMap = criteria.getCriteria();
        System.out.println(criteriaMap);
        for(Map.Entry<String, List<String>> entry : criteriaMap.entrySet()){
            switch (entry.getKey()) {
                case "author" -> {
                    for (String author : entry.getValue())
                        books.addAll(bookRepo.findAllByAuthorContaining(author));
                }
                case "title" -> {
                    for (String title : entry.getValue())
                        books.addAll(bookRepo.findAllByTitleContaining(title));
                }
                case "publisher" -> {
                    for (String publisher : entry.getValue())
                        books.addAll(bookRepo.findAllByPublisherContaining(publisher));
                }
                case "year" -> {
                    int year_int = Integer.parseInt(entry.getValue().get(0));
                    for (String year : entry.getValue())
                        books.addAll(bookRepo.findAllByYear(year_int));
                }
                case "genres" -> {
                    for (String genre : entry.getValue()) {
                        List<Genre> genres = new ArrayList<>();
                        Genre g = new Genre(genre);
                        genres.add(g);
                        books.addAll(bookRepo.findAllByGenres(genres));
                    }
                }
                case "rating" -> {
                    for (String rating : entry.getValue()) {
                        float r = Float.parseFloat(rating);
                        books.addAll(bookRepo.findAllByRating(r));
                    }
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

        // Ensure genres are saved properly
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
                imageRepo.delete(book.getImage());
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


}
