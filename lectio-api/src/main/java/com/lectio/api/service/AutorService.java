package com.lectio.api.service;

import com.lectio.api.model.Autor;

import java.util.List;
import java.util.Optional;

public interface AutorService {

    List<Autor> findAll();

    Optional<Autor> findById(Long id);

    List<Autor> buscarPorNombre(String nombre);

    Autor save(Autor autor);

    Autor update(Long id, Autor autorActualizado);

    void deleteById(Long id);
}
