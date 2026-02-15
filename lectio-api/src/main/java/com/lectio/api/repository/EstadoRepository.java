package com.lectio.api.repository;

import com.lectio.api.model.Estado;
import com.lectio.api.model.Estado.EstadoNombre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoRepository extends JpaRepository<Estado, Long> {

    Optional<Estado> findByNombre(EstadoNombre nombre);
}
