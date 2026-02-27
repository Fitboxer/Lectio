package com.lectio.api.repository;

import com.lectio.api.model.Comentario;
import com.lectio.api.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findTop5ByLibroOrderByFechaCreacionDesc(Libro libro);

    List<Comentario> findByLibroIdOrderByFechaCreacionDesc(Long libroId);

    void deleteByUsuarioId(Long usuarioId);
}