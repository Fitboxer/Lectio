package com.lectio.api.repository;

import com.lectio.api.model.Autor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutorRepository extends JpaRepository<Autor, Long> {

    List<Autor> findByNombreContainingIgnoreCase(String nombre);

    Optional<Autor> findByNombre(String nombre);
}
