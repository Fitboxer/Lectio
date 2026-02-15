package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "libro_autores")
@Data
public class LibroAutor {

    @EmbeddedId
    private LibroAutorId id = new LibroAutorId();

    @ManyToOne
    @MapsId("libroId")
    @JoinColumn(name = "libro_id")
    private Libro libro;

    @ManyToOne
    @MapsId("autorId")
    @JoinColumn(name = "autor_id")
    private Autor autor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolAutoria rolAutoria = RolAutoria.Autor;

    public enum RolAutoria {
        Autor, Coautor, Traductor
    }
}
