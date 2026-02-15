package com.lectio.api.dto;

import java.time.LocalDateTime;

public record UsuarioLibroEstadoDTO(
        Long usuarioLibroId,
        Long estadoId,
        String estadoNombre,
        LocalDateTime fechaEstado,
        String notaPersonal
) {}
