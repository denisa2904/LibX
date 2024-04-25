package org.example.libx.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "ratings")
public class Rating {
    @Setter
    @Getter
    @Id
    @GenericGenerator(
            name = "rating_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "rating_sequence"
    )
    private UUID id;

    @Setter
    @Getter
    @Column(name = "value", nullable = false)
    private int value;

    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    public Rating() {
    }

    public Rating(int value, User user, Book book) {
        setValue(value);
        setUser(user);
        setBook(book);
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
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
