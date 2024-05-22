package org.example.libx.repository;

import org.example.libx.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ImageRepo extends JpaRepository<Image, UUID> {
    Optional<Image> findImageByBookId(UUID bookId);
}
