package com.lectio.api.repository;

import com.lectio.api.model.UsuarioLibro;
import com.lectio.api.model.UsuarioLibroEstado;
import com.lectio.api.model.UsuarioLibroEstadoId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioLibroEstadoRepository extends JpaRepository<UsuarioLibroEstado, UsuarioLibroEstadoId> {

    // Todos los estados (historial) de un usuario-libro
    List<UsuarioLibroEstado> findByUsuarioLibroOrderByFechaEstadoDesc(UsuarioLibro usuarioLibro);

    // Último estado asignado
    Optional<UsuarioLibroEstado> findFirstByUsuarioLibroOrderByFechaEstadoDesc(UsuarioLibro usuarioLibro);
}
