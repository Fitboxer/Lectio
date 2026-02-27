package com.lectio.api.controller;

import com.lectio.api.dto.UsuarioLibroDTO;
import com.lectio.api.dto.UsuarioLibroEstadoDTO;
import com.lectio.api.mapper.UsuarioLibroEstadoMapper;
import com.lectio.api.mapper.UsuarioLibroMapper;
import com.lectio.api.model.Estado;
import com.lectio.api.model.UsuarioLibro;
import com.lectio.api.model.UsuarioLibroEstado;
import com.lectio.api.service.BibliotecaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/biblioteca")
@CrossOrigin(origins = "*")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;
    private final UsuarioLibroMapper usuarioLibroMapper;
    private final UsuarioLibroEstadoMapper usuarioLibroEstadoMapper;

    public BibliotecaController(BibliotecaService bibliotecaService,
                                UsuarioLibroMapper usuarioLibroMapper,
                                UsuarioLibroEstadoMapper usuarioLibroEstadoMapper) {
        this.bibliotecaService = bibliotecaService;
        this.usuarioLibroMapper = usuarioLibroMapper;
        this.usuarioLibroEstadoMapper = usuarioLibroEstadoMapper;
    }

    @PostMapping("/{usuarioId}/libros/{libroId}")
    public ResponseEntity<UsuarioLibroDTO> agregarLibro(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId) {

        System.out.println("📥 ===== ENDPOINT AGREGAR LIBRO =====");
        System.out.println("📥 Usuario ID: " + usuarioId);
        System.out.println("📥 Libro ID: " + libroId);
        System.out.println("📥 Usuario autenticado: " +
                SecurityContextHolder.getContext().getAuthentication().getName());

        try {
            UsuarioLibro ul = bibliotecaService.agregarLibroAUsuario(usuarioId, libroId);
            return ResponseEntity.ok(usuarioLibroMapper.toDTO(ul));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{usuarioId}/libros/{libroId}")
    public ResponseEntity<Void> eliminarLibro(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId) {

        System.out.println("🗑️ ===== ENDPOINT ELIMINAR LIBRO =====");
        System.out.println("🗑️ Usuario ID: " + usuarioId);
        System.out.println("🗑️ Libro ID: " + libroId);
        System.out.println("🗑️ Usuario autenticado: " +
                SecurityContextHolder.getContext().getAuthentication().getName());

        try {
            bibliotecaService.eliminarLibroDeUsuario(usuarioId, libroId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{usuarioId}/libros")
    public ResponseEntity<List<UsuarioLibroDTO>> obtenerBiblioteca(@PathVariable Long usuarioId) {
        List<UsuarioLibro> librosUsuario = bibliotecaService.obtenerBibliotecaUsuario(usuarioId);

        // Asegurar que el mapper incluye el libro completo
        List<UsuarioLibroDTO> dtos = librosUsuario.stream()
                .map(usuarioLibroMapper::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/usuarios/{usuarioId}/libros/{libroId}/verificar")
    public ResponseEntity<?> verificarLibroEnBiblioteca(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId) {

        try {
            boolean enBiblioteca = bibliotecaService.existeEnBiblioteca(usuarioId, libroId);
            String estado = null;

            if (enBiblioteca) {
                try {
                    UsuarioLibroEstado ultimoEstado = bibliotecaService.obtenerUltimoEstado(usuarioId, libroId);
                    if (ultimoEstado != null &&
                            ultimoEstado.getEstado() != null &&
                            ultimoEstado.getEstado().getNombre() != null) {
                        estado = ultimoEstado.getEstado().getNombre().name();
                    }
                } catch (Exception e) {
                    // Si falla al obtener el estado, dejamos null
                    System.err.println("Error obteniendo estado: " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("enBiblioteca", enBiblioteca);
            response.put("estado", estado);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error verificando libro en biblioteca: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("enBiblioteca", false);
            response.put("estado", null);
            return ResponseEntity.ok(response);
        }
    }

    public record CambioEstadoRequest(Estado.EstadoNombre estado, String nota) {}

    @PostMapping("/{usuarioId}/libros/{libroId}/estado")
    public ResponseEntity<UsuarioLibroEstadoDTO> cambiarEstado(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId,
            @RequestBody CambioEstadoRequest request) {

        System.out.println("📥 ===== ENDPOINT POST ESTADO =====");
        System.out.println("📥 Usuario ID: " + usuarioId);
        System.out.println("📥 Libro ID: " + libroId);
        System.out.println("📥 Estado: " + request.estado());
        System.out.println("📥 Nota: " + request.nota());

        // Verificar autenticación actual
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔐 Usuario autenticado en el método: " + (auth != null ? auth.getName() : "NO"));
        System.out.println("🔐 Authorities: " + (auth != null ? auth.getAuthorities() : "NONE"));

        try {
            UsuarioLibroEstado estado = bibliotecaService.cambiarEstadoDeLibro(
                    usuarioId,
                    libroId,
                    request.estado(),
                    request.nota()
            );
            return ResponseEntity.ok(usuarioLibroEstadoMapper.toDTO(estado));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{usuarioId}/libros/{libroId}/estado")
    public ResponseEntity<UsuarioLibroEstadoDTO> obtenerUltimoEstado(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId) {

        UsuarioLibroEstado estado = bibliotecaService.obtenerUltimoEstado(usuarioId, libroId);
        return ResponseEntity.ok(usuarioLibroEstadoMapper.toDTO(estado));
    }


}