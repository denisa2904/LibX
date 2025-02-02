package org.example.libx.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GenericGenerator(
            name = "comment_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "comment_sequence"
    )
    private UUID id;

    @Setter
    @Column(name = "comment", nullable = false)
    private String content;

    @Setter
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Setter
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Setter
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    public Comment() {
    }

    public Comment(String content, User user, Book book) {
        setContent(content);
        setUser(user);
        setBook(book);
        setCreatedAt(LocalDateTime.now());
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + getId() +
                ", content='" + getContent() + '\'' +
                ", user=" + getUser().getId() +
                ", book=" + getBook().getId() +
                ", createdAt=" + getCreatedAt() +
                '}';
    }

}
