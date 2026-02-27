package com.lectio.api.dto;

import java.time.LocalDateTime;

public class ComentarioDTO {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private Long libroId;
    private String contenido;
    private LocalDateTime fechaCreacion;
    private boolean editado;

    public ComentarioDTO() {}

    public ComentarioDTO(Long id, Long usuarioId, String usuarioNombre, Long libroId,
                         String contenido, LocalDateTime fechaCreacion, boolean editado) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.libroId = libroId;
        this.contenido = contenido;
        this.fechaCreacion = fechaCreacion;
        this.editado = editado;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public Long getLibroId() { return libroId; }
    public void setLibroId(Long libroId) { this.libroId = libroId; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public boolean isEditado() { return editado; }
    public void setEditado(boolean editado) { this.editado = editado; }
}