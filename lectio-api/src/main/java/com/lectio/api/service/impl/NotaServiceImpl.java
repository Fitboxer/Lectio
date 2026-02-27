package com.lectio.api.service.impl;

import com.lectio.api.dto.NotaDTO;
import com.lectio.api.dto.NotaRequest;
import com.lectio.api.model.Libro;
import com.lectio.api.model.Nota;
import com.lectio.api.model.Usuario;
import com.lectio.api.repository.LibroRepository;
import com.lectio.api.repository.NotaRepository;
import com.lectio.api.repository.UsuarioRepository;
import com.lectio.api.service.NotaService;
import com.lectio.api.mapper.NotaMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotaServiceImpl implements NotaService {

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private NotaMapper notaMapper;

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        String username = authentication.getName();
        return usuarioRepository.findByNombre(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    @Override
    public List<NotaDTO> obtenerNotasDeLibro(Long libroId, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + libroId));

        List<Nota> notas = notaRepository.findByUsuarioAndLibroOrderByFechaCreacionDesc(usuario, libro);

        return notas.stream()
                .map(notaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotaDTO crearNota(Long libroId, NotaRequest request, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + libroId));

        Nota nota = new Nota(usuario, libro, request.getContenido());
        Nota notaGuardada = notaRepository.save(nota);

        return notaMapper.toDTO(notaGuardada);
    }

    @Override
    @Transactional
    public NotaDTO actualizarNota(Long notaId, NotaRequest request, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Nota nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("Nota no encontrada con ID: " + notaId));

        // Verificar que la nota pertenece al usuario
        if (!nota.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para editar esta nota");
        }

        nota.setContenido(request.getContenido());
        Nota notaActualizada = notaRepository.save(nota);

        return notaMapper.toDTO(notaActualizada);
    }

    @Override
    @Transactional
    public void eliminarNota(Long notaId, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Nota nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("Nota no encontrada con ID: " + notaId));

        // Verificar que la nota pertenece al usuario
        if (!nota.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar esta nota");
        }

        notaRepository.delete(nota);
    }
}