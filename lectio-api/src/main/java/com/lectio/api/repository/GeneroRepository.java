package com.lectio.api.repository;

import com.lectio.api.model.Genero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneroRepository extends JpaRepository<Genero, Long> {

    Optional<Genero> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}
