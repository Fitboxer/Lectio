package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "formato")
@Data
public class Formato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;  // Físico, Ebook, Audiolibro
}
