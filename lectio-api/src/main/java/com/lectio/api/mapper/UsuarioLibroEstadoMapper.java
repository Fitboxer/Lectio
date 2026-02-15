package com.lectio.api.mapper;

import com.lectio.api.dto.UsuarioLibroEstadoDTO;
import com.lectio.api.model.UsuarioLibroEstado;
import org.springframework.stereotype.Component;

@Component
public class UsuarioLibroEstadoMapper {

    public UsuarioLibroEstadoDTO toDTO(UsuarioLibroEstado ule) {
        return new UsuarioLibroEstadoDTO(
                ule.getUsuarioLibro().getId(),
                ule.getEstado().getId(),
                ule.getEstado().getNombre().name(),
                ule.getFechaEstado(),
                ule.getNotaPersonal()
        );
    }
}
