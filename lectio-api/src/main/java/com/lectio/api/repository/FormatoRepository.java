package com.lectio.api.repository;

import com.lectio.api.model.Formato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FormatoRepository extends JpaRepository<Formato, Long> {

    Optional<Formato> findByNombre(String nombre);
}
