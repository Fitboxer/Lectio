package com.lectio.api.dto;

import com.lectio.api.model.Usuario;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UsuarioDTO(
        Long id,
        String email,
        String nombre,
        LocalDate fechaNac,
        String imagen,
        Long rolId,
        boolean banned,
        LocalDateTime creadoEn
) {

    // Método de ayuda para convertir desde la entidad Usuario
    public static UsuarioDTO fromEntity(Usuario u) {
        Long rolId = (u.getRol() != null) ? u.getRol().getId() : null;

        return new UsuarioDTO(
                u.getId(),
                u.getEmail(),
                u.getNombre(),
                u.getFechaNac(),
                u.getImagen(),
                rolId,
                u.isBanned(),
                u.getCreadoEn()
        );
    }
}
