package com.lectio.api.dto;

import java.time.LocalDateTime;

public record UsuarioLibroDTO(
        Long id,
        Long usuarioId,
        Long libroId,
        LibroDTO libro,
        LocalDateTime fechaAgregado,
        String estadoActual
) {}