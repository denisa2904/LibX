package org.example.libx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "book")
public class Book {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "author", nullable = false)
    private String author;

    @Column(name = "isbn", nullable = false)
    private String isbn;

    @Column(name = "publisher", nullable = false)
    private String publisher;

    @Column(name = "year", nullable = false)
    private int year;

    @Column( name = "description",
            columnDefinition = "TEXT",
            nullable = false)
    private String description;

    @Column(name = "rating", nullable = false)
    private float rating;

    @OneToOne(mappedBy = "book", cascade = CascadeType.ALL)
    private Image image;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_genres",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> genres;

    public Book(){

    }

    public Book(String title, String author, String isbn, int year, String description){
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.year = year;
        this.description = description;
    }


    @Override
    public String toString(){
        return "Book{" +
                "id=" + getId() +
                ", title='" + getTitle() + '\'' +
                ", author='" + getAuthor() + '\'' +
                ", isbn='" + getIsbn() + '\'' +
                ", year=" + getYear() +
                ", description='" + getDescription() + '\'' +
                '}';
    }


}
