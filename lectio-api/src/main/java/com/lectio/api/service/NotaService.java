package com.lectio.api.service;

import com.lectio.api.dto.NotaDTO;
import com.lectio.api.dto.NotaRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface NotaService {

    List<NotaDTO> obtenerNotasDeLibro(Long libroId, Authentication authentication);

    NotaDTO crearNota(Long libroId, NotaRequest request, Authentication authentication);

    NotaDTO actualizarNota(Long notaId, NotaRequest request, Authentication authentication);

    void eliminarNota(Long notaId, Authentication authentication);
}