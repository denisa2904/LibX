package org.example.libx.repository;

import org.example.libx.model.Book;
import org.example.libx.model.Genre;
import org.example.libx.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookRepo extends JpaRepository<Book, UUID>{

    Optional<Book> findBookByTitle(String title);

    List<Book> findAllByAuthor(String author);
    List<Book> findAllByPublisher(String publisher);
    List<Book> findAllByYear(int year);

    List<Book> findAllByTitleContaining(String title);
    List<Book> findAllByAuthorContaining(String author);
    List<Book> findAllByGenres(List<Genre> genres);
    List<Book> findAllByRating(float rating);
    List<Book> findAllByPublisherContaining(String publisher);
    List<Book> findAllByDescriptionContaining(String description);



}
