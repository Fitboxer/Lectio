package com.lectio.api.service.impl;

import com.lectio.api.dto.ComentarioDTO;
import com.lectio.api.dto.ComentarioRequest;
import com.lectio.api.model.Comentario;
import com.lectio.api.model.Libro;
import com.lectio.api.model.Usuario;
import com.lectio.api.repository.ComentarioRepository;
import com.lectio.api.repository.LibroRepository;
import com.lectio.api.repository.UsuarioRepository;
import com.lectio.api.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComentarioServiceImpl implements ComentarioService {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroRepository libroRepository;

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        String username = authentication.getName();
        return usuarioRepository.findByNombre(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    private ComentarioDTO convertirADTO(Comentario comentario) {
        return new ComentarioDTO(
                comentario.getId(),
                comentario.getUsuario().getId(),
                comentario.getUsuario().getNombre(),
                comentario.getLibro().getId(),
                comentario.getContenido(),
                comentario.getFechaCreacion(),
                comentario.isEditado()
        );
    }

    @Override
    public List<ComentarioDTO> obtenerUltimosComentarios(Long libroId) {
        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + libroId));

        List<Comentario> comentarios = comentarioRepository.findTop5ByLibroOrderByFechaCreacionDesc(libro);

        return comentarios.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComentarioDTO crearComentario(Long libroId, ComentarioRequest request, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        if (usuario.isBanned()) {
            throw new RuntimeException("Usuario baneado. No puede realizar comentarios.");
        }

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + libroId));

        Comentario comentario = new Comentario(usuario, libro, request.getContenido());
        Comentario comentarioGuardado = comentarioRepository.save(comentario);

        return convertirADTO(comentarioGuardado);
    }

    @Override
    @Transactional
    public void eliminarComentario(Long comentarioId, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        // Verificar si es admin
        boolean esAdmin = usuario.getRol() != null && "ADMIN".equals(usuario.getRol().getNombre());

        if (!esAdmin) {
            throw new RuntimeException("Solo los administradores pueden eliminar comentarios");
        }

        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado con ID: " + comentarioId));

        comentarioRepository.delete(comentario);
    }

    @Override
    @Transactional
    public void banearUsuario(Long usuarioId, Authentication authentication) {
        Usuario admin = obtenerUsuarioAutenticado(authentication);

        // Verificar si es admin
        boolean esAdmin = admin.getRol() != null && "ADMIN".equals(admin.getRol().getNombre());

        if (!esAdmin) {
            throw new RuntimeException("Solo los administradores pueden banear usuarios");
        }

        Usuario usuarioABanear = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        usuarioABanear.setBanned(true);
        usuarioRepository.save(usuarioABanear);

        // Opcional: eliminar todos los comentarios del usuario baneado
        comentarioRepository.deleteByUsuarioId(usuarioId);
    }
}