package com.lectio.api.controller;

import com.lectio.api.dto.NotaDTO;
import com.lectio.api.dto.NotaRequest;
import com.lectio.api.service.NotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biblioteca")
@CrossOrigin(origins = "*")
public class NotaController {

    @Autowired
    private NotaService notaService;

    @GetMapping("/{usuarioId}/libros/{libroId}/notas")
    public ResponseEntity<List<NotaDTO>> obtenerNotas(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId) {

        System.out.println("📝 ===== OBTENER NOTAS =====");
        System.out.println("📝 Usuario ID: " + usuarioId);
        System.out.println("📝 Libro ID: " + libroId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<NotaDTO> notas = notaService.obtenerNotasDeLibro(libroId, auth);

        return ResponseEntity.ok(notas);
    }

    @PostMapping("/{usuarioId}/libros/{libroId}/notas")
    public ResponseEntity<NotaDTO> crearNota(
            @PathVariable Long usuarioId,
            @PathVariable Long libroId,
            @RequestBody NotaRequest request) {

        System.out.println("📝 ===== CREAR NOTA =====");
        System.out.println("📝 Usuario ID: " + usuarioId);
        System.out.println("📝 Libro ID: " + libroId);
        System.out.println("📝 Contenido: " + request.getContenido());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        NotaDTO nota = notaService.crearNota(libroId, request, auth);

        return ResponseEntity.ok(nota);
    }

    @PutMapping("/notas/{notaId}")
    public ResponseEntity<NotaDTO> actualizarNota(
            @PathVariable Long notaId,
            @RequestBody NotaRequest request) {

        System.out.println("📝 ===== ACTUALIZAR NOTA =====");
        System.out.println("📝 Nota ID: " + notaId);
        System.out.println("📝 Nuevo contenido: " + request.getContenido());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        NotaDTO nota = notaService.actualizarNota(notaId, request, auth);

        return ResponseEntity.ok(nota);
    }

    @DeleteMapping("/notas/{notaId}")
    public ResponseEntity<Void> eliminarNota(@PathVariable Long notaId) {

        System.out.println("📝 ===== ELIMINAR NOTA =====");
        System.out.println("📝 Nota ID: " + notaId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        notaService.eliminarNota(notaId, auth);

        return ResponseEntity.noContent().build();
    }
}