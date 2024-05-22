package org.example.libx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "genres")
public class Genre {
    @Id
    @GenericGenerator(
            name = "genre_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "genre_sequence"
    )
    private UUID id;

    @Column(name = "genre", nullable = false)
    private String title;

    @ManyToMany(mappedBy = "genre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Book> books;

    public Genre() {
    }

    public Genre(String genre) {
        this.title = genre;
    }

    @Override
    public String toString() {
        return "Genre" +
                "=" + title;
    }


}
