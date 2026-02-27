package com.lectio.api.controller;

import com.lectio.api.dto.ComentarioDTO;
import com.lectio.api.dto.ComentarioRequest;
import com.lectio.api.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "*")
public class ComentarioController {

    @Autowired
    private ComentarioService comentarioService;

    @GetMapping("/libro/{libroId}/ultimos")
    public ResponseEntity<List<ComentarioDTO>> obtenerUltimosComentarios(@PathVariable Long libroId) {
        System.out.println("💬 ===== OBTENER ÚLTIMOS COMENTARIOS =====");
        System.out.println("💬 Libro ID: " + libroId);

        List<ComentarioDTO> comentarios = comentarioService.obtenerUltimosComentarios(libroId);
        return ResponseEntity.ok(comentarios);
    }

    @PostMapping("/libro/{libroId}")
    public ResponseEntity<ComentarioDTO> crearComentario(
            @PathVariable Long libroId,
            @RequestBody ComentarioRequest request) {

        System.out.println("💬 ===== CREAR COMENTARIO =====");
        System.out.println("💬 Libro ID: " + libroId);
        System.out.println("💬 Contenido: " + request.getContenido());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ComentarioDTO comentario = comentarioService.crearComentario(libroId, request, auth);

        return ResponseEntity.ok(comentario);
    }

    @DeleteMapping("/{comentarioId}")
    public ResponseEntity<Void> eliminarComentario(@PathVariable Long comentarioId) {
        System.out.println("💬 ===== ELIMINAR COMENTARIO =====");
        System.out.println("💬 Comentario ID: " + comentarioId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        comentarioService.eliminarComentario(comentarioId, auth);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/banear/{usuarioId}")
    public ResponseEntity<Void> banearUsuario(@PathVariable Long usuarioId) {
        System.out.println("🚫 ===== BANEAR USUARIO =====");
        System.out.println("🚫 Usuario ID: " + usuarioId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        comentarioService.banearUsuario(usuarioId, auth);

        return ResponseEntity.ok().build();
    }
}