package com.lectio.api.service.impl;

import com.lectio.api.mapper.LibroMapper;
import com.lectio.api.model.Libro;
import com.lectio.api.repository.LibroRepository;
import com.lectio.api.service.LibroService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LibroServiceImpl implements LibroService {

    private final LibroRepository libroRepository;
    private final LibroMapper libroMapper;

    public LibroServiceImpl(LibroRepository libroRepository, LibroMapper libroMapper) {
        this.libroRepository = libroRepository;
        this.libroMapper = libroMapper;
    }

    @Override
    public List<Libro> findAll() {
        return libroRepository.findAll();
    }

    @Override
    public Optional<Libro> findById(Long id) {
        return libroRepository.findById(id);
    }

    @Override
    public List<Libro> buscarPorTitulo(String titulo) {
        return libroRepository.findByTituloContainingIgnoreCase(titulo);
    }

    @Override
    public Libro save(Libro libro) {
        return libroRepository.save(libro);
    }

    @Override
    public Libro update(Long id, Libro libroActualizado) {
        return libroRepository.findById(id)
                .map(libro -> {
                    libro.setTitulo(libroActualizado.getTitulo());
                    libro.setSubtitulo(libroActualizado.getSubtitulo());
                    libro.setSinopsis(libroActualizado.getSinopsis());
                    libro.setIsbn13(libroActualizado.getIsbn13());
                    libro.setPaginas(libroActualizado.getPaginas());
                    libro.setImagen(libroActualizado.getImagen());
                    libro.setAnioPublicacion(libroActualizado.getAnioPublicacion());
                    libro.setIdioma(libroActualizado.getIdioma());
                    libro.setEditorial(libroActualizado.getEditorial());
                    libro.setFormato(libroActualizado.getFormato());
                    libro.setPublico(libroActualizado.getPublico());
                    libro.setGeneros(libroActualizado.getGeneros());

                    return libroRepository.save(libro);
                })
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id: " + id));
    }

    @Override
    public void deleteById(Long id) {
        libroRepository.deleteById(id);
    }

    // ✅ IMPLEMENTACIÓN CORRECTA AQUÍ
    @Override
    public Optional<Libro> findByGoogleId(String googleId) {
        return libroRepository.findByGoogleId(googleId);
    }

    @Override
    public Libro crearLibroDesdeGoogle(String titulo,
                                       String sinopsis,
                                       String imagen,
                                       Integer anioPublicacion,
                                       String editorialNombre,
                                       List<String> autoresNombres,
                                       List<String> generosNombres,
                                       String googleId,
                                       String isbn13) {

        System.out.println("📥 ===== SERVICIO crearLibroDesdeGoogle =====");
        System.out.println("📥 Título: " + titulo);
        System.out.println("📥 Editorial: " + editorialNombre);
        System.out.println("📥 Autores: " + autoresNombres);
        System.out.println("📥 Géneros: " + generosNombres);
        System.out.println("📥 GoogleId: " + googleId);

        // Verificar si ya existe
        Optional<Libro> existente = libroRepository.findByGoogleId(googleId);
        if (existente.isPresent()) {
            System.out.println("✅ Libro ya existe con ID: " + existente.get().getId());
            return existente.get();
        }

        // Crear nuevo usando el mapper
        System.out.println("📥 Creando nuevo libro con mapper...");
        Libro libro = libroMapper.fromGoogleData(
                titulo, sinopsis, imagen, anioPublicacion,
                editorialNombre, autoresNombres, generosNombres,
                googleId, isbn13
        );

        System.out.println("📥 Libro creado, guardando en BD...");
        Libro guardado = libroRepository.save(libro);
        System.out.println("✅ Libro guardado con ID: " + guardado.getId());

        return guardado;
    }
}