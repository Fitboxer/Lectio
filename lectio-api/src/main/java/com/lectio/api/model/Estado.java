package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "estado")
@Data
public class Estado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private EstadoNombre nombre;

    public enum EstadoNombre {
        Leyendo, Pendiente, Abandonado, Terminado
    }
}
