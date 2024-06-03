package org.example.libx.service;

import lombok.RequiredArgsConstructor;
import org.example.libx.model.AuthResponse;
import org.example.libx.model.LoginRequest;
import org.example.libx.model.RegisterRequest;
import org.example.libx.model.User;
import org.example.libx.repository.UserRepo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.Map;
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
        System.out.println(request.getUsername() + " " + request.getPassword());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        System.out.println("Authenticated");
        Optional<User> userOptional = repo.findUserByUsername(request.getUsername());
        User user;
        if(userOptional.isPresent())
            user = userOptional.get();
        else return null;
        Map<String, Object> claims = Map.of("role", user.getRole());
        String jwt = jwtService.generateToken(user.getUsername());
        return AuthResponse.builder()
                .token(jwt)
                .build();
    }

    public AuthResponse register(RegisterRequest request){
        User user = new User(request.getUsername(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));
        repo.save(user);
        Map<String, Object> claims = Map.of("role", user.getRole());
        String jwt = jwtService.generateToken(user.getUsername());
        return AuthResponse.builder()
                .token(jwt)
                .build();
    }

}
