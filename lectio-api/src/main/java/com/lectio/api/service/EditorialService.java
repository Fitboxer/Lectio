package com.lectio.api.service;

import com.lectio.api.model.Editorial;

import java.util.List;
import java.util.Optional;

public interface EditorialService {

    List<Editorial> findAll();

    Optional<Editorial> findById(Long id);

    List<Editorial> buscarPorNombre(String nombre);

    Editorial save(Editorial editorial);

    Editorial update(Long id, Editorial editorialActualizada);

    void deleteById(Long id);
}
