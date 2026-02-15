package com.lectio.api.controller;

import com.lectio.api.dto.AutorDTO;
import com.lectio.api.dto.LibroDTO;
import com.lectio.api.mapper.LibroMapper;
import com.lectio.api.model.Libro;
import com.lectio.api.service.LibroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    private final LibroService libroService;
    private final LibroMapper libroMapper;

    public LibroController(LibroService libroService, LibroMapper libroMapper) {
        this.libroService = libroService;
        this.libroMapper = libroMapper;
    }

    @GetMapping
    public ResponseEntity<List<LibroDTO>> obtenerTodos() {
        List<Libro> libros = libroService.findAll();
        List<LibroDTO> dtos = libros.stream()
                .map(libroMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/google/{googleId}")
    public ResponseEntity<?> buscarPorGoogleId(@PathVariable String googleId) {
        Optional<Libro> libro = libroService.findByGoogleId(googleId);

        if (libro.isPresent()) {
            // Devolvemos SOLO el ID (número) y un indicador de que existe
            return ResponseEntity.ok(Map.of(
                    "id", libro.get().getId(),
                    "existe", true
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("existe", false));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> obtenerPorId(@PathVariable Long id) {
        return libroService.findById(id)
                .map(libroMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<LibroDTO>> buscarPorTitulo(@RequestParam String titulo) {
        List<Libro> libros = libroService.buscarPorTitulo(titulo);
        List<LibroDTO> dtos = libros.stream()
                .map(libroMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody LibroDTO dto) {
        System.out.println("📥 ===== ENDPOINT POST /api/libros =====");
        System.out.println("📥 Título: " + dto.titulo());
        System.out.println("📥 Usuario autenticado: " +
                SecurityContextHolder.getContext().getAuthentication().getName());
        System.out.println("📥 Authorities: " +
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        try {
            System.out.println("📥 Intentando crear libro...");
            Libro libro = libroMapper.toEntity(dto);
            Libro guardado = libroService.save(libro);
            LibroDTO respuesta = libroMapper.toDTO(guardado);

            System.out.println("✅ Libro guardado con ID: " + respuesta.id());

            return ResponseEntity
                    .created(URI.create("/api/libros/" + respuesta.id()))
                    .body(respuesta);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> crearLibroDesdeGoogle(@RequestBody GoogleLibroRequest request) {
        System.out.println("📥 ===== ENDPOINT /google =====");
        System.out.println("📥 Título: " + request.titulo());
        System.out.println("📥 Usuario autenticado: " +
                SecurityContextHolder.getContext().getAuthentication().getName());
        System.out.println("📥 Authorities: " +
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        try {
            Libro guardado = libroService.crearLibroDesdeGoogle(
                    request.titulo(),
                    request.sinopsis(),
                    request.imagen(),
                    request.anioPublicacion(),
                    request.editorial(),
                    request.autores(),
                    request.generos(),
                    request.googleId(),
                    request.isbn13()
            );

            System.out.println("✅ Libro guardado con ID: " + guardado.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("id", guardado.getId()));

        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /google: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibroDTO> actualizar(@PathVariable Long id, @RequestBody LibroDTO dto) {
        try {
            Libro libroActualizado = libroService.update(id, libroMapper.toEntity(dto));
            return ResponseEntity.ok(libroMapper.toDTO(libroActualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            libroService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔐 Test Auth - Usuario: " + (auth != null ? auth.getName() : "null"));
        System.out.println("🔐 Test Auth - Authorities: " + (auth != null ? auth.getAuthorities() : "null"));

        return ResponseEntity.ok(Map.of(
                "authenticated", auth != null,
                "username", auth != null ? auth.getName() : null,
                "authorities", auth != null ? auth.getAuthorities().toString() : null
        ));
    }

    public record GoogleLibroRequest(
            String titulo,
            String sinopsis,
            String imagen,
            Integer anioPublicacion,
            String editorial,
            List<String> autores,
            List<String> generos,
            String googleId,
            String isbn13
    ) {}
}
