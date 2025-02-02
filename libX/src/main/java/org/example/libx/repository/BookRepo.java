package org.example.libx.repository;

import org.example.libx.model.Book;
import org.example.libx.model.Genre;
import org.example.libx.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import jakarta.transaction.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookRepo extends JpaRepository<Book, UUID>{
    List<Book> findAllByAuthor(String author);
    List<Book> findAllByPublisher(String publisher);
    List<Book> findAllByYear(int year);

    List<Book> findAllByTitleContainingIgnoreCase(String title);
    List<Book> findAllByAuthorContainingIgnoreCase(String author);
    List<Book> findAllByGenres(List<Genre> genres);
    List<Book> findAllByPublisherContainingIgnoreCase(String publisher);
    List<Book> findAllByDescriptionContainingIgnoreCase(String description);

    List<Book> findAllByRatingGreaterThanEqual(float rating);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM recommendations WHERE recommended_book_id = :bookId OR book_id = :bookId", nativeQuery = true)
    void deleteAllRecommendationsInvolvingBookId(@Param("bookId") UUID bookId);

}
