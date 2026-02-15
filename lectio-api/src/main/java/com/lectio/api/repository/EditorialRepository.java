package com.lectio.api.repository;

import com.lectio.api.model.Editorial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EditorialRepository extends JpaRepository<Editorial, Long> {

    List<Editorial> findByNombreContainingIgnoreCase(String nombre);

    Optional<Editorial> findByNombre(String nombre);
}
