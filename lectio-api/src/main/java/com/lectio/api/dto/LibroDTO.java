package com.lectio.api.dto;

import java.util.List;

public record LibroDTO(
        Long id,
        String titulo,
        String subtitulo,
        String sinopsis,
        String isbn13,
        Integer paginas,
        String imagen,
        Integer anioPublicacion,
        String idioma,
        EditorialDTO editorial,      // ← Cambiado de Long editorialId
        FormatoDTO formato,          // ← Cambiado de Long formatoId
        PublicoObjetivoDTO publico,  // ← Cambiado de Long publicoId
        List<GeneroDTO> generos,     // ← Cambiado de List<Long> generosIds
        List<AutorDTO> autores,      // ← Cambiado de List<Long> autoresIds
        String googleId
) {}