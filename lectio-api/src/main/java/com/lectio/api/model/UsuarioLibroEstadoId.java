package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Embeddable
@Data
public class UsuarioLibroEstadoId implements Serializable {
    private Long usuarioLibroId;
    private Long estadoId;
}
