package org.example.libx.api;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.libx.model.AuthResponse;
import org.example.libx.model.LoginRequest;
import org.example.libx.model.RegisterRequest;
import org.example.libx.model.User;
import org.example.libx.service.AuthService;
import org.example.libx.service.JwtService;
import org.example.libx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(path = "api/auth")
public class AuthController {
    private final AuthService service;
    private final UserService userService;

    @Autowired
    public AuthController(AuthService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping(path = "/check")
    public ResponseEntity<String> checkAuth(@NonNull HttpServletRequest request) {
        if (userService.getUsernameFromJwt(request) != null) {
            System.out.println("User is authenticated");
            return ResponseEntity.status(HttpStatus.OK).body("User is authenticated");
        } else {
            System.out.println("User is not authenticated");
            return ResponseEntity.status(HttpStatus.OK).body("User is not authenticated");
        }
    }
    @PostMapping(path = "/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        if(!service.validateNewUser(new User(request.getUsername(),
                request.getEmail(), request.getPassword()
        ))){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(AuthResponse.builder().token("Invalid").build());
        }

        AuthResponse authResponse = service.register(request);
        setHttpOnlyCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = service.login(request);
        if(authResponse == null){
            System.out.println("Invalid login");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(AuthResponse.builder().token("Invalid").build());
        }
        setHttpOnlyCookie(response, authResponse.getToken());
        System.out.println("Logged in");
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setSecure(true);
        response.addCookie(cookie);
        System.out.println("Logged out");
        return ResponseEntity.ok("Logged out successfully");
    }


    private void setHttpOnlyCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("authToken", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        cookie.setSecure(true);
        response.addCookie(cookie);
    }
}
