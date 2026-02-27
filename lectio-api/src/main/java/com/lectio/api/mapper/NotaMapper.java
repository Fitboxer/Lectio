package com.lectio.api.mapper;

import com.lectio.api.dto.NotaDTO;
import com.lectio.api.model.Nota;
import org.springframework.stereotype.Component;

@Component
public class NotaMapper {

    public NotaDTO toDTO(Nota nota) {
        if (nota == null) return null;

        return new NotaDTO(
                nota.getId(),
                nota.getUsuario().getId(),
                nota.getLibro().getId(),
                nota.getContenido(),
                nota.getFechaCreacion(),
                nota.getFechaActualizacion()
        );
    }
}