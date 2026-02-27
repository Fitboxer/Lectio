package com.lectio.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentarios")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "libro_id", nullable = false)
    private Libro libro;

    @Column(nullable = false, length = 500)
    private String contenido;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "editado", nullable = false)
    private boolean editado = false;

    // Constructores
    public Comentario() {}

    public Comentario(Usuario usuario, Libro libro, String contenido) {
        this.usuario = usuario;
        this.libro = libro;
        this.contenido = contenido;
        this.fechaCreacion = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Libro getLibro() { return libro; }
    public void setLibro(Libro libro) { this.libro = libro; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) {
        this.contenido = contenido;
        this.editado = true;
    }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public boolean isEditado() { return editado; }
    public void setEditado(boolean editado) { this.editado = editado; }
}