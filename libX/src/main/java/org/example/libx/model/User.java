package org.example.libx.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
@Table(name = "users")
public class User implements UserDetails{
    @Setter
    @Id
    @GenericGenerator(
            name = "user_sequence",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @GeneratedValue(
            strategy = GenerationType.IDENTITY,
            generator = "user_sequence"
    )
    private UUID id;

    @Setter
    @Column(name ="username", nullable = false, unique = true)
    private String username;
    @Setter
    @Column(name = "email", nullable = false)
    private String email;
    @Column(name = "hashed_password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @JsonIgnore
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "favorites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> favorites = new ArrayList<>();

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    List<Rating> ratings = new ArrayList<>();

    public User() {
    }

    public User( String username, String email, String password) {
        setUsername(username);
        setEmail(email);
        setPassword(password);
        setRole("ADMIN");
    }

    public void setRole(String role) {
        this.role = Role.valueOf(role);
    }

    private void setPassword(String password) {
        this.password = password;
    }

    //getters

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public List<Book> getFavorites() {
        return favorites;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public List<Rating> getRatings() {
        return ratings;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
