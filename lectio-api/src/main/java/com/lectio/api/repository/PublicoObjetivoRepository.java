package com.lectio.api.repository;

import com.lectio.api.model.PublicoObjetivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicoObjetivoRepository extends JpaRepository<PublicoObjetivo, Long> {

    Optional<PublicoObjetivo> findByNombre(String nombre);
}
