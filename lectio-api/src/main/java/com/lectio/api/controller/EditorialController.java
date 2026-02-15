package com.lectio.api.controller;

import com.lectio.api.dto.EditorialDTO;
import com.lectio.api.mapper.EditorialMapper;
import com.lectio.api.model.Editorial;
import com.lectio.api.service.EditorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/editoriales")
@CrossOrigin(origins = "*")
public class EditorialController {

    private final EditorialService editorialService;
    private final EditorialMapper editorialMapper;

    public EditorialController(EditorialService editorialService,
                               EditorialMapper editorialMapper) {
        this.editorialService = editorialService;
        this.editorialMapper = editorialMapper;
    }

    @GetMapping
    public ResponseEntity<List<EditorialDTO>> obtenerTodas() {
        List<EditorialDTO> dtos = editorialService.findAll()
                .stream()
                .map(editorialMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EditorialDTO> obtenerPorId(@PathVariable Long id) {
        return editorialService.findById(id)
                .map(editorialMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<EditorialDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<EditorialDTO> dtos = editorialService.buscarPorNombre(nombre)
                .stream()
                .map(editorialMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<EditorialDTO> crear(@RequestBody EditorialDTO dto) {
        Editorial editorial = editorialMapper.toEntity(dto);
        Editorial guardada = editorialService.save(editorial);
        EditorialDTO respuesta = editorialMapper.toDTO(guardada);
        return ResponseEntity
                .created(URI.create("/api/editoriales/" + respuesta.id()))
                .body(respuesta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EditorialDTO> actualizar(@PathVariable Long id, @RequestBody EditorialDTO dto) {
        try {
            Editorial actualizada = editorialService.update(id, editorialMapper.toEntity(dto));
            return ResponseEntity.ok(editorialMapper.toDTO(actualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            editorialService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
