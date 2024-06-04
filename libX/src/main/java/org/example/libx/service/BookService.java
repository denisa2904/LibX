package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.model.Book;
import org.example.libx.model.Criteria;
import org.example.libx.model.Genre;
import org.example.libx.model.User;
import org.example.libx.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
public class BookService {
    private final BookRepo bookRepo;
    private final CommentRepo commentRepo;
    private final ImageRepo imageRepo;
    private final RatingRepo ratingRepo;

    private final UserRepo userRepo;



    @Autowired
    public BookService(BookRepo bookRepo, CommentRepo commentRepo, ImageRepo imageRepo, RatingRepo ratingRepo, UserRepo userRepo) {
        this.bookRepo = bookRepo;
        this.commentRepo = commentRepo;
        this.imageRepo = imageRepo;
        this.ratingRepo = ratingRepo;
        this.userRepo = userRepo;
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
            bookRepo.save(book);
            return 1;
        }
        return 0;
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
        Optional<Book> oldBook = bookRepo.findById(id);
        if(oldBook.isEmpty())
            return 0;
        Book updatedBook = oldBook.get();
        updatedBook.setTitle(book.getTitle());
        updatedBook.setAuthor(book.getAuthor());
        updatedBook.setPublisher(book.getPublisher());
        updatedBook.setYear(book.getYear());
        updatedBook.setGenres(book.getGenres());
        updatedBook.setRating(book.getRating());
        updatedBook.setDescription(book.getDescription());
        bookRepo.save(updatedBook);
        return 1;
    }

    public int deleteBook(UUID id) {
        try{
            Optional<Book> book = bookRepo.findById(id);
            if(book.isEmpty())
                return 0;
            List<User> users = userRepo.findAll();
            for(User user : users){
                user.getFavorites().remove(book.get());
                user.getRentedBooks().remove(book.get());
            }
            for(Book b : book.get().getRecommendations()){
                b.getRecommendations().remove(book.get());
            }
            commentRepo.deleteAllByBookId(book.get().getId());
            imageRepo.delete(book.get().getImage());
            ratingRepo.deleteAllByBookId(book.get().getId());
            bookRepo.deleteById(id);
            Optional<Book> b = bookRepo.findById(id);
            if(b.isPresent()) {
                System.out.println();
                System.out.println();
                System.out.println();
                System.out.println("Book not deleted");
            }
        } catch (Exception e) {
            return 0;
        }
        return 1;
    }


}
