package com.lectio.api.service;

import com.lectio.api.dto.ComentarioDTO;
import com.lectio.api.dto.ComentarioRequest;
import org.springframework.security.core.Authentication;
import java.util.List;

public interface ComentarioService {
    List<ComentarioDTO> obtenerUltimosComentarios(Long libroId);
    ComentarioDTO crearComentario(Long libroId, ComentarioRequest request, Authentication authentication);
    void eliminarComentario(Long comentarioId, Authentication authentication);
    void banearUsuario(Long usuarioId, Authentication authentication);
}