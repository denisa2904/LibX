package org.example.libx.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.example.libx.model.Book;
import org.example.libx.model.User;
import org.example.libx.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepo userRepo;

    private final JwtService jwtService;

    @Autowired
    public UserService(UserRepo userRepo, JwtService jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    public String getUsernameFromJwt(@NonNull HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        String jwt;
        jwt = authHeader.substring(7);
        return jwtService.extractUsername(jwt);
    }

    public User getUserByUsername(String username) {
        return userRepo.findUserByUsername(username).orElse(null);
    }

    public Optional<User> getUserById(UUID id) {
        return userRepo.findUserById(id);
    }

    public User getUserByEmail(String email) {
        return userRepo.findUserByEmail(email).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public int deleteUser(UUID userId){
        Optional<User> user = getUserById(userId);
        if(user.isPresent()){
            userRepo.delete(user.get());
            return 1;
        }
        return 0;
    }

    public int updateUser(UUID userId, User user){
        Optional<User> u = getUserById(userId);
        if(u.isPresent()){
            u.get().setUsername(user.getUsername());
            u.get().setEmail(user.getEmail());
            userRepo.save(u.get());
            return 1;
        }
        return 0;
    }

    public List<Book> getUserFavorites(UUID userId){
        Optional<User> user = getUserById(userId);
        return user.map(User::getFavorites).orElse(null);
    }

    public int addFavorite(UUID userId, Book book){
        Optional<User> user = getUserById(userId);
        if(user.isPresent()){
            user.get().getFavorites().add(book);
            userRepo.save(user.get());
            return 1;
        }
        return 0;
    }

    public int removeFavorite(UUID userId, Book book){
        Optional<User> user = getUserById(userId);
        if(user.isPresent()){
            user.get().getFavorites().remove(book);
            userRepo.save(user.get());
            return 1;
        }
        return 0;
    }
}
