package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios_libros_estados")
@Data
public class UsuarioLibroEstado {

    @EmbeddedId
    private UsuarioLibroEstadoId id = new UsuarioLibroEstadoId();

    @ManyToOne
    @MapsId("usuarioLibroId")
    @JoinColumn(name = "usuario_libro_id", nullable = false)
    private UsuarioLibro usuarioLibro;

    @ManyToOne
    @MapsId("estadoId")
    @JoinColumn(name = "estado_id", nullable = false)
    private Estado estado;

    private LocalDateTime fechaEstado = LocalDateTime.now();

    private String notaPersonal;
}
