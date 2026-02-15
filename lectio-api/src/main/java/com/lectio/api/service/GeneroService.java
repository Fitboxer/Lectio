package com.lectio.api.service;

import com.lectio.api.model.Genero;

import java.util.List;
import java.util.Optional;

public interface GeneroService {

    List<Genero> findAll();

    Optional<Genero> findById(Long id);

    Optional<Genero> findByNombre(String nombre);

    Genero save(Genero genero);

    Genero update(Long id, Genero generoActualizado);

    void deleteById(Long id);
}
