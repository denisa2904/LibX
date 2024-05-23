package org.example.libx.api;

import org.example.libx.model.AuthResponse;
import org.example.libx.model.LoginRequest;
import org.example.libx.model.RegisterRequest;
import org.example.libx.model.User;
import org.example.libx.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/auth")
public class AuthController {
    private final AuthService service;

    @Autowired
    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping(path = "/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if(!service.validateNewUser(new User(request.getUsername(),
                request.getEmail(), request.getPassword()
        ))){
            return ResponseEntity.status(400).contentType(MediaType.APPLICATION_JSON)
                    .body(AuthResponse.builder().token("Invalid").build());
        }
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }
}
