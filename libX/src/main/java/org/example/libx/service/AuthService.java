package org.example.libx.service;

import lombok.RequiredArgsConstructor;
import org.example.libx.helpers.AuthResponse;
import org.example.libx.helpers.LoginRequest;
import org.example.libx.helpers.RegisterRequest;
import org.example.libx.model.User;
import org.example.libx.repository.UserRepo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public boolean validateNewUser(User user) {
        if(user.getUsername().isEmpty() || user.getPassword().isEmpty() || user.getEmail().isEmpty())
            return false;
        if(repo.findUserByUsername(user.getUsername()).isPresent())
            return false;
        return repo.findUserByEmail(user.getEmail()).isEmpty();
    }

    public AuthResponse login(LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        Optional<User> userOptional = repo.findUserByUsername(request.getUsername());
        User user;
        if(userOptional.isPresent())
            user = userOptional.get();
        else return null;
        String jwt = jwtService.generateToken(user.getUsername(), user.getRole());
        return AuthResponse.builder()
                .token(jwt)
                .build();
    }

    public AuthResponse register(RegisterRequest request){
        User user = new User(request.getUsername(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));
        repo.save(user);
        String jwt = jwtService.generateToken(user.getUsername(), user.getRole());
        return AuthResponse.builder()
                .token(jwt)
                .build();
    }

}
