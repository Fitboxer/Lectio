package com.lectio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class LibroAutorId implements Serializable {
    private Long libroId;
    private Long autorId;
}
