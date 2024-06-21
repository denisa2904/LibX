package org.example.libx.repository;

import org.example.libx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface UserRepo extends JpaRepository<User, UUID> {
    Optional<User> findUserById(UUID id);
    Optional<User> findUserByUsername(String username);
    Optional<User> findUserByEmail(String email);
    @Query(value = "SELECT rented_on FROM rented_books WHERE user_id = :userId AND book_id = :bookId", nativeQuery = true)
    LocalDate findRentedOnDateByUserIdAndBookId(@Param("userId") UUID userId, @Param("bookId") UUID bookId);
}
