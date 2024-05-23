package org.example.libx.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "images")
public class Image {
    @Id
    @GenericGenerator(
            name = "image_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "image_sequence"
    )
    private UUID id;
    @Getter
    @Column(name = "title",
            nullable = false)
    private String title;
    @Setter
    @Getter
    @Column(name = "type",
            nullable = false)
    private String type;

    @OneToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;

    public Image() {
    }

    public Image(String title, String type) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.type = "image/"+type;
    }

    @Override
    public String toString() {
        return "Image{" +
                ", title='" + getTitle() + '\'' +
                ", type='" + getType() + '\'' +
                '}';
    }
}
