package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "editorial")
@Data
public class Editorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String pais;

    private String sitioWeb;
}
