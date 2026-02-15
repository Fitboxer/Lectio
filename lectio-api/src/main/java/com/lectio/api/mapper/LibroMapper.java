package com.lectio.api.mapper;

import com.lectio.api.dto.*;
import com.lectio.api.model.*;
import com.lectio.api.repository.EditorialRepository;
import com.lectio.api.repository.FormatoRepository;
import com.lectio.api.repository.PublicoObjetivoRepository;
import com.lectio.api.repository.GeneroRepository;
import com.lectio.api.repository.AutorRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class LibroMapper {

    private final ModelMapper modelMapper;
    private final EditorialRepository editorialRepository;
    private final FormatoRepository formatoRepository;
    private final PublicoObjetivoRepository publicoObjetivoRepository;
    private final GeneroRepository generoRepository;
    private final AutorRepository autorRepository;

    public LibroMapper(ModelMapper modelMapper,
                       EditorialRepository editorialRepository,
                       FormatoRepository formatoRepository,
                       PublicoObjetivoRepository publicoObjetivoRepository,
                       GeneroRepository generoRepository,
                       AutorRepository autorRepository) {
        this.modelMapper = modelMapper;
        this.editorialRepository = editorialRepository;
        this.formatoRepository = formatoRepository;
        this.publicoObjetivoRepository = publicoObjetivoRepository;
        this.generoRepository = generoRepository;
        this.autorRepository = autorRepository;
    }

    public LibroDTO toDTO(Libro libro) {
        // Mapear géneros
        List<GeneroDTO> generosDTO = libro.getGeneros()
                .stream()
                .map(g -> new GeneroDTO(g.getId(), g.getNombre()))
                .toList();

        // Mapear autores
        List<AutorDTO> autoresDTO = libro.getAutores()
                .stream()
                .map(a -> new AutorDTO(a.getId(), a.getNombre()))
                .toList();

        // Mapear editorial
        EditorialDTO editorialDTO = libro.getEditorial() != null
                ? new EditorialDTO(libro.getEditorial().getId(), libro.getEditorial().getNombre())
                : null;

        // Mapear formato
        FormatoDTO formatoDTO = libro.getFormato() != null
                ? new FormatoDTO(libro.getFormato().getId(), libro.getFormato().getNombre())
                : null;

        // Mapear público objetivo
        PublicoObjetivoDTO publicoDTO = libro.getPublico() != null
                ? new PublicoObjetivoDTO(libro.getPublico().getId(), libro.getPublico().getNombre())
                : null;

        // ✅ CONVERTIR LA IMAGEN A HTTPS
        String imagen = libro.getImagen();
        if (imagen != null && imagen.startsWith("http://")) {
            imagen = imagen.replace("http://", "https://");
        }

        return new LibroDTO(
                libro.getId(),
                libro.getTitulo(),
                libro.getSubtitulo(),
                libro.getSinopsis(),
                libro.getIsbn13(),
                libro.getPaginas(),
                imagen,  // ← Usar la imagen convertida
                libro.getAnioPublicacion(),
                libro.getIdioma(),
                editorialDTO,
                formatoDTO,
                publicoDTO,
                generosDTO,
                autoresDTO,
                libro.getGoogleId()
        );
    }

    public Libro toEntity(LibroDTO dto) {
        Libro libro = new Libro();
        libro.setId(dto.id());
        libro.setTitulo(dto.titulo());
        libro.setSubtitulo(dto.subtitulo());
        libro.setSinopsis(dto.sinopsis());
        libro.setIsbn13(dto.isbn13());
        libro.setPaginas(dto.paginas());
        libro.setImagen(dto.imagen());
        libro.setAnioPublicacion(dto.anioPublicacion());
        libro.setIdioma(dto.idioma());
        libro.setGoogleId(dto.googleId());

        // Manejar editorial (ahora es un objeto, no un ID)
        if (dto.editorial() != null) {
            try {
                Editorial editorial = editorialRepository.findById(dto.editorial().id())
                        .orElseGet(() -> {
                            Editorial nueva = new Editorial();
                            nueva.setId(dto.editorial().id());
                            nueva.setNombre(dto.editorial().nombre());
                            return editorialRepository.save(nueva);
                        });
                libro.setEditorial(editorial);
            } catch (Exception e) {
                System.err.println("Error con editorial: " + e.getMessage());
            }
        }

        // Manejar formato
        if (dto.formato() != null) {
            try {
                Formato formato = formatoRepository.findById(dto.formato().id())
                        .orElseThrow(() -> new RuntimeException("Formato no encontrado con id " + dto.formato().id()));
                libro.setFormato(formato);
            } catch (Exception e) {
                System.err.println("Error con formato: " + e.getMessage());
            }
        }

        // Manejar público objetivo
        if (dto.publico() != null) {
            try {
                PublicoObjetivo publico = publicoObjetivoRepository.findById(dto.publico().id())
                        .orElseThrow(() -> new RuntimeException("Público objetivo no encontrado con id " + dto.publico().id()));
                libro.setPublico(publico);
            } catch (Exception e) {
                System.err.println("Error con público objetivo: " + e.getMessage());
            }
        }

        // Manejar géneros (ahora es lista de objetos)
        if (dto.generos() != null && !dto.generos().isEmpty()) {
            try {
                List<Genero> generos = dto.generos().stream()
                        .map(generoDTO -> generoRepository.findById(generoDTO.id())
                                .orElseGet(() -> {
                                    Genero nuevo = new Genero();
                                    nuevo.setId(generoDTO.id());
                                    nuevo.setNombre(generoDTO.nombre());
                                    return generoRepository.save(nuevo);
                                }))
                        .collect(Collectors.toList());
                libro.setGeneros(generos);
            } catch (Exception e) {
                System.err.println("Error con géneros: " + e.getMessage());
            }
        }

        // Manejar autores (ahora es lista de objetos)
        if (dto.autores() != null && !dto.autores().isEmpty()) {
            try {
                List<Autor> autores = dto.autores().stream()
                        .map(autorDTO -> autorRepository.findById(autorDTO.id())
                                .orElseGet(() -> {
                                    Autor nuevo = new Autor();
                                    nuevo.setId(autorDTO.id());
                                    nuevo.setNombre(autorDTO.nombre());
                                    return autorRepository.save(nuevo);
                                }))
                        .collect(Collectors.toList());
                libro.setAutores(autores);
            } catch (Exception e) {
                System.err.println("Error con autores: " + e.getMessage());
            }
        }

        return libro;
    }

    public Libro fromGoogleData(String titulo,
                                String sinopsis,
                                String imagen,
                                Integer anioPublicacion,
                                String editorialNombre,
                                List<String> autoresNombres,
                                List<String> generosNombres,
                                String googleId,
                                String isbn13) {

        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setSinopsis(sinopsis);
        libro.setImagen(imagen);
        libro.setAnioPublicacion(anioPublicacion);
        libro.setGoogleId(googleId);
        libro.setIsbn13(isbn13);

        // Manejar editorial por nombre
        if (editorialNombre != null && !editorialNombre.isBlank()) {
            Editorial editorial = editorialRepository.findByNombre(editorialNombre)
                    .orElseGet(() -> {
                        Editorial nueva = new Editorial();
                        nueva.setNombre(editorialNombre);
                        return editorialRepository.save(nueva);
                    });
            libro.setEditorial(editorial);
        }

        // Manejar autores por nombre
        if (autoresNombres != null && !autoresNombres.isEmpty()) {
            List<Autor> autores = autoresNombres.stream()
                    .map(nombre -> {
                        System.out.println("Procesando autor: " + nombre);
                        return autorRepository.findByNombre(nombre)
                                .orElseGet(() -> {
                                    Autor nuevo = new Autor();
                                    nuevo.setNombre(nombre);
                                    return autorRepository.save(nuevo);
                                });
                    })
                    .collect(Collectors.toList());
            libro.setAutores(autores);
            System.out.println("✅ Autores guardados: " + autores.size());
        } else {
            System.out.println("⚠️ No hay autores para guardar");
        }

        if (generosNombres != null && !generosNombres.isEmpty()) {
            List<Genero> generos = generosNombres.stream()
                    .map(nombre -> generoRepository.findByNombre(nombre)
                            .orElseGet(() -> {
                                Genero nuevo = new Genero();
                                nuevo.setNombre(nombre);
                                return generoRepository.save(nuevo);
                            }))
                    .collect(Collectors.toList());
            libro.setGeneros(generos);
        }

        return libro;
    }
}