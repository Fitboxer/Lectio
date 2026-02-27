package com.lectio.api.repository;

import com.lectio.api.model.Libro;
import com.lectio.api.model.Nota;
import com.lectio.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {

    List<Nota> findByUsuarioAndLibroOrderByFechaCreacionDesc(Usuario usuario, Libro libro);

    List<Nota> findByUsuarioIdAndLibroIdOrderByFechaCreacionDesc(Long usuarioId, Long libroId);

    Optional<Nota> findByIdAndUsuarioId(Long id, Long usuarioId);

    void deleteByIdAndUsuarioId(Long id, Long usuarioId);
}