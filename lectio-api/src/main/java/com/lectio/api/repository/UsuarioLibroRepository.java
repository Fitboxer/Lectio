package com.lectio.api.repository;

import com.lectio.api.model.Usuario;
import com.lectio.api.model.Libro;
import com.lectio.api.model.UsuarioLibro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioLibroRepository extends JpaRepository<UsuarioLibro, Long> {

    List<UsuarioLibro> findByUsuario(Usuario usuario);

    List<UsuarioLibro> findByLibro(Libro libro);

    Optional<UsuarioLibro> findByUsuarioAndLibro(Usuario usuario, Libro libro);

    boolean existsByUsuarioAndLibro(Usuario usuario, Libro libro);

    boolean existsByUsuarioIdAndLibroId(Long usuarioId, Long libroId);
}
