package org.example.libx.repository;

import org.example.libx.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GenreRepo extends JpaRepository<Genre, UUID> {
    Optional<Genre> findGenreByTitle(String title);
    List<Genre> findAllByTitleContaining(String title);

}
