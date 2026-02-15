package com.lectio.api.repository;

import com.lectio.api.model.Autor;
import com.lectio.api.model.Libro;
import com.lectio.api.model.LibroAutor;
import com.lectio.api.model.LibroAutorId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LibroAutorRepository extends JpaRepository<LibroAutor, LibroAutorId> {

    List<LibroAutor> findByLibro(Libro libro);

    List<LibroAutor> findByAutor(Autor autor);
}
