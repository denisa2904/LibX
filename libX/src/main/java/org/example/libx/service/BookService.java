package org.example.libx.service;

import jakarta.transaction.Transactional;
import org.example.libx.model.Book;
import org.example.libx.model.Criteria;
import org.example.libx.model.Genre;
import org.example.libx.repository.BookRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
public class BookService {
    private final BookRepo bookRepo;

    @Autowired
    public BookService(BookRepo bookRepo) {
        this.bookRepo = bookRepo;
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
        if(bookRepo.findById(id).isEmpty())
            return 0;
        bookRepo.deleteById(id);
        return 1;
    }


}
