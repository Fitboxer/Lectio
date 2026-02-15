package com.lectio.api.service;

import com.lectio.api.model.Libro;
import com.lectio.api.repository.LibroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface LibroService {

    List<Libro> findAll();

    Optional<Libro> findById(Long id);

    List<Libro> buscarPorTitulo(String titulo);

    Libro save(Libro libro);

    Libro update(Long id, Libro libroActualizado);

    void deleteById(Long id);

    Optional<Libro> findByGoogleId(String googleId);

    Libro crearLibroDesdeGoogle(String titulo,
                                String sinopsis,
                                String imagen,
                                Integer anioPublicacion,
                                String editorialNombre,
                                List<String> autoresNombres,
                                List<String> generosNombres,
                                String googleId,
                                String isbn13);
}