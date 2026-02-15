package com.lectio.api.controller;

import com.lectio.api.model.Rol;
import com.lectio.api.model.Usuario;
import com.lectio.api.repository.RolRepository;
import com.lectio.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.lectio.api.security.jwt.JwtProvider;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthController(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PasswordEncoder passwordEncoder,
                          JwtProvider jwtProvider) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    // ✅ REGISTRO
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        // Validación básica de campos
        if (req.email() == null || req.email().isBlank()
                || req.username() == null || req.username().isBlank()
                || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body("Email/usuario/contraseña son obligatorios");
        }

        // Comprobar email y username únicos
        if (usuarioRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El email ya está registrado");
        }
        if (usuarioRepository.existsByNombre(req.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El usuario ya existe");
        }

        // Rol por defecto: USER (se crea si no existe)
        Rol rolUser = rolRepository.findByNombre("USER")
                .orElseGet(() -> {
                    Rol r = new Rol();
                    r.setNombre("USER");
                    return rolRepository.save(r);
                });

        // Crear usuario nuevo
        Usuario u = new Usuario();
        u.setEmail(req.email().trim());
        u.setNombre(req.username().trim());
        u.setContrasena(passwordEncoder.encode(req.password()));
        u.setRol(rolUser);
        u.setBanned(false);
        u.setCreadoEn(LocalDateTime.now());

        usuarioRepository.save(u);

        String token = jwtProvider.generateToken(u);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, u.getNombre(), u.getId(), List.of(rolUser.getNombre())));
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        // Validación básica de campos
        if (req.username() == null || req.username().isBlank()
                || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body("Usuario y contraseña son obligatorios");
        }

        // Buscar usuario por nombre
        Usuario u = usuarioRepository.findByNombre(req.username().trim())
                .orElse(null);

        // Usuario no existe
        if (u == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }

        // Contraseña incorrecta
        if (!passwordEncoder.matches(req.password(), u.getContrasena())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }

        if (u.isBanned()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuario bloqueado");
        }

        String token = jwtProvider.generateToken(u);
        String roleName = (u.getRol() != null) ? u.getRol().getNombre() : "USER";

        return ResponseEntity.ok(new AuthResponse(token, u.getNombre(), u.getId(), List.of(roleName)));
    }

    // ===== DTOs (para no crear más archivos) =====
    public record RegisterRequest(String email, String username, String password) {}
    public record LoginRequest(String username, String password) {}
    public record AuthResponse(String token, String username, Long userId, List<String> roles) {}
}
