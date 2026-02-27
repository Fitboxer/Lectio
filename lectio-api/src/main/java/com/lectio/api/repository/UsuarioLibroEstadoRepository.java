package com.lectio.api.repository;

import com.lectio.api.model.UsuarioLibro;
import com.lectio.api.model.UsuarioLibroEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioLibroEstadoRepository extends JpaRepository<UsuarioLibroEstado, Long> {

    Optional<UsuarioLibroEstado> findFirstByUsuarioLibroOrderByFechaEstadoDesc(UsuarioLibro usuarioLibro);

    List<UsuarioLibroEstado> findByUsuarioLibro(UsuarioLibro usuarioLibro);
}