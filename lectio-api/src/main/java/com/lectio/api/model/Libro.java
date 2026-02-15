package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "libro")
@Data
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String subtitulo;

    @Column(columnDefinition = "TEXT")
    private String sinopsis;

    @Column(unique = true)
    private String isbn13;

    private Integer paginas;

    private String imagen;

    private Integer anioPublicacion;

    private String idioma;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @ManyToOne
    @JoinColumn(name = "editorial_id")
    private Editorial editorial;

    @ManyToOne
    @JoinColumn(name = "formato_id")
    private Formato formato;

    @ManyToOne
    @JoinColumn(name = "publico_id")
    private PublicoObjetivo publico;

    @ManyToMany
    @JoinTable(
            name = "libro_generos",
            joinColumns = @JoinColumn(name = "libro_id"),
            inverseJoinColumns = @JoinColumn(name = "genero_id")
    )
    private List<Genero> generos = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "libro_autores",
            joinColumns = @JoinColumn(name = "libro_id"),
            inverseJoinColumns = @JoinColumn(name = "autor_id")
    )
    private List<Autor> autores = new ArrayList<>();

    @OneToMany(mappedBy = "libro")
    private List<UsuarioLibro> usuarios = new ArrayList<>();
}