package org.example.libx.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "ratings")
public class Rating {
    @Id
    @JsonIgnore
    @GenericGenerator(
            name = "rating_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "rating_sequence"
    )
    private UUID id;

    @Column(name = "rating", nullable = false)
    private int value;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    public Rating() {
    }

    public Rating(int value, User user, Book book) {
        setValue(value);
        setUser(user);
        setBook(book);
    }

    @Override
    public String toString() {
        return "Rating{" +
                "id=" + getId() +
                ", value=" + getValue() +
                ", user=" + getUser().getId() +
                ", book=" + getBook().getId() +
                '}';
    }
}
