package com.lectio.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "notas")
public class Nota {

    // Getters y Setters
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @Setter
    @ManyToOne
    @JoinColumn(name = "libro_id", nullable = false)
    @JsonIgnore
    private Libro libro;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Setter
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Setter
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Constructores
    public Nota() {}

    public Nota(Usuario usuario, Libro libro, String contenido) {
        this.usuario = usuario;
        this.libro = libro;
        this.contenido = contenido;
        this.fechaCreacion = LocalDateTime.now();
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
        this.fechaActualizacion = LocalDateTime.now();
    }

}