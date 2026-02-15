package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "publico_objetivo")
@Data
public class PublicoObjetivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;  // Infantil, Juvenil, Adulto
}
