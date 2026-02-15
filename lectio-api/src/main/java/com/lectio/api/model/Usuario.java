package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false, unique = true)
    private String nombre;

    private LocalDate fechaNac;

    private String imagen;

    @ManyToOne
    @JoinColumn(name = "rol_id")
    private Rol rol;

    @Column(nullable = false)
    private boolean banned = false;

    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "usuario")
    private List<UsuarioLibro> libros = new ArrayList<>();
}
