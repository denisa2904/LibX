package org.example.libx.repository;

import org.example.libx.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatingRepo extends JpaRepository<Rating, UUID>
{
    Optional<Rating> findRatingByBookIdAndUserId(UUID bookId, UUID userId);
    List<Rating> findAllByBookId(UUID bookId);
}
