package com.lectio.api.dto;

import java.time.LocalDateTime;

public class NotaDTO {
    private Long id;
    private Long usuarioId;
    private Long libroId;
    private String contenido;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Constructores
    public NotaDTO() {}

    public NotaDTO(Long id, Long usuarioId, Long libroId, String contenido,
                   LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.libroId = libroId;
        this.contenido = contenido;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Long getLibroId() { return libroId; }
    public void setLibroId(Long libroId) { this.libroId = libroId; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}