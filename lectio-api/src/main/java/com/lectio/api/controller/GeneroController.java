package com.lectio.api.controller;

import com.lectio.api.dto.GeneroDTO;
import com.lectio.api.mapper.GeneroMapper;
import com.lectio.api.model.Genero;
import com.lectio.api.service.GeneroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/generos")
@CrossOrigin(origins = "*")
public class GeneroController {

    private final GeneroService generoService;
    private final GeneroMapper generoMapper;

    public GeneroController(GeneroService generoService, GeneroMapper generoMapper) {
        this.generoService = generoService;
        this.generoMapper = generoMapper;
    }

    @GetMapping
    public ResponseEntity<List<GeneroDTO>> obtenerTodos() {
        List<GeneroDTO> dtos = generoService.findAll()
                .stream()
                .map(generoMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneroDTO> obtenerPorId(@PathVariable Long id) {
        return generoService.findById(id)
                .map(generoMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GeneroDTO> crear(@RequestBody GeneroDTO dto) {
        Genero genero = generoMapper.toEntity(dto);
        Genero guardado = generoService.save(genero);
        GeneroDTO respuesta = generoMapper.toDTO(guardado);
        return ResponseEntity
                .created(URI.create("/api/generos/" + respuesta.id()))
                .body(respuesta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeneroDTO> actualizar(@PathVariable Long id, @RequestBody GeneroDTO dto) {
        try {
            Genero actualizado = generoService.update(id, generoMapper.toEntity(dto));
            return ResponseEntity.ok(generoMapper.toDTO(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            generoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
