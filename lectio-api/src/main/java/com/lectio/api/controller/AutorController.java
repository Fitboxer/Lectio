package com.lectio.api.controller;

import com.lectio.api.dto.AutorDTO;
import com.lectio.api.mapper.AutorMapper;
import com.lectio.api.model.Autor;
import com.lectio.api.service.AutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/autores")
@CrossOrigin(origins = "*")
public class AutorController {

    private final AutorService autorService;
    private final AutorMapper autorMapper;

    public AutorController(AutorService autorService, AutorMapper autorMapper) {
        this.autorService = autorService;
        this.autorMapper = autorMapper;
    }

    @GetMapping
    public ResponseEntity<List<AutorDTO>> obtenerTodos() {
        List<AutorDTO> dtos = autorService.findAll()
                .stream()
                .map(autorMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutorDTO> obtenerPorId(@PathVariable Long id) {
        return autorService.findById(id)
                .map(autorMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<AutorDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<AutorDTO> dtos = autorService.buscarPorNombre(nombre)
                .stream()
                .map(autorMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<AutorDTO> crear(@RequestBody AutorDTO dto) {
        Autor autor = autorMapper.toEntity(dto);
        Autor guardado = autorService.save(autor);
        AutorDTO respuesta = autorMapper.toDTO(guardado);
        return ResponseEntity
                .created(URI.create("/api/autores/" + respuesta.id()))
                .body(respuesta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutorDTO> actualizar(@PathVariable Long id, @RequestBody AutorDTO dto) {
        try {
            Autor actualizado = autorService.update(id, autorMapper.toEntity(dto));
            return ResponseEntity.ok(autorMapper.toDTO(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            autorService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
