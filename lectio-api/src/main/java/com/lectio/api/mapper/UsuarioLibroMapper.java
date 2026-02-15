package com.lectio.api.mapper;

import com.lectio.api.dto.UsuarioLibroDTO;
import com.lectio.api.model.UsuarioLibro;
import com.lectio.api.model.UsuarioLibroEstado;
import com.lectio.api.service.BibliotecaService;
import org.springframework.stereotype.Component;

@Component
public class UsuarioLibroMapper {

    private final LibroMapper libroMapper;
    private final BibliotecaService bibliotecaService; // ← Inyectar servicio

    public UsuarioLibroMapper(LibroMapper libroMapper, BibliotecaService bibliotecaService) {
        this.libroMapper = libroMapper;
        this.bibliotecaService = bibliotecaService;
    }

    public UsuarioLibroDTO toDTO(UsuarioLibro entity) {
        String estadoActual = null;
        try {
            UsuarioLibroEstado ultimoEstado = bibliotecaService.obtenerUltimoEstado(
                    entity.getUsuario().getId(),
                    entity.getLibro().getId()
            );
            if (ultimoEstado != null && ultimoEstado.getEstado() != null) {
                estadoActual = ultimoEstado.getEstado().getNombre().name();
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo último estado: " + e.getMessage());
        }

        return new UsuarioLibroDTO(
                entity.getId(),
                entity.getUsuario().getId(),
                entity.getLibro().getId(),
                libroMapper.toDTO(entity.getLibro()),
                entity.getFechaAgregado().atStartOfDay(),
                estadoActual
        );
    }
}