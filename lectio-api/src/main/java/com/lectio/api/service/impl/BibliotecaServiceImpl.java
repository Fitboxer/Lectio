package com.lectio.api.service.impl;

import com.lectio.api.model.*;
import com.lectio.api.repository.*;
import com.lectio.api.service.BibliotecaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BibliotecaServiceImpl implements BibliotecaService {

    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;
    private final UsuarioLibroRepository usuarioLibroRepository;
    private final UsuarioLibroEstadoRepository usuarioLibroEstadoRepository;
    private final EstadoRepository estadoRepository;
    private final NotaRepository notaRepository;  // ✅ AÑADIR

    public BibliotecaServiceImpl(UsuarioRepository usuarioRepository,
                                 LibroRepository libroRepository,
                                 UsuarioLibroRepository usuarioLibroRepository,
                                 UsuarioLibroEstadoRepository usuarioLibroEstadoRepository,
                                 EstadoRepository estadoRepository,
                                 NotaRepository notaRepository) {  // ✅ AÑADIR
        this.usuarioRepository = usuarioRepository;
        this.libroRepository = libroRepository;
        this.usuarioLibroRepository = usuarioLibroRepository;
        this.usuarioLibroEstadoRepository = usuarioLibroEstadoRepository;
        this.estadoRepository = estadoRepository;
        this.notaRepository = notaRepository;  // ✅ AÑADIR
    }

    @Override
    @Transactional
    public UsuarioLibro agregarLibroAUsuario(Long usuarioId, Long libroId) {
        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id " + usuarioId));
        var libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id " + libroId));

        if (usuarioLibroRepository.existsByUsuarioAndLibro(usuario, libro)) {
            throw new RuntimeException("El libro ya está en la biblioteca del usuario");
        }

        UsuarioLibro ul = new UsuarioLibro();
        ul.setUsuario(usuario);
        ul.setLibro(libro);

        return usuarioLibroRepository.save(ul);
    }

    @Override
    @Transactional
    public void eliminarLibroDeUsuario(Long usuarioId, Long libroId) {
        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id " + usuarioId));
        var libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id " + libroId));

        var usuarioLibro = usuarioLibroRepository.findByUsuarioAndLibro(usuario, libro)
                .orElseThrow(() -> new RuntimeException("El libro no está en la biblioteca del usuario"));

        // ✅ 1. Eliminar los estados asociados
        List<UsuarioLibroEstado> estados = usuarioLibroEstadoRepository.findByUsuarioLibro(usuarioLibro);
        if (!estados.isEmpty()) {
            System.out.println("🗑️ Eliminando " + estados.size() + " estados asociados");
            usuarioLibroEstadoRepository.deleteAll(estados);
        }

        // ✅ 2. Eliminar las notas del usuario para este libro
        // Usando el método que ya tienes en el repositorio
        List<Nota> notas = notaRepository.findByUsuarioIdAndLibroIdOrderByFechaCreacionDesc(usuarioId, libroId);
        if (!notas.isEmpty()) {
            System.out.println("🗑️ Eliminando " + notas.size() + " notas asociadas");
            notaRepository.deleteAll(notas);
        }

        // ✅ 3. Eliminar el libro de la biblioteca
        usuarioLibroRepository.delete(usuarioLibro);
        System.out.println("✅ Libro eliminado de la biblioteca del usuario");
    }

    @Override
    public List<UsuarioLibro> obtenerBibliotecaUsuario(Long usuarioId) {
        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id " + usuarioId));
        return usuarioLibroRepository.findByUsuario(usuario);
    }

    @Override
    @Transactional
    public UsuarioLibroEstado cambiarEstadoDeLibro(Long usuarioId, Long libroId,
                                                   Estado.EstadoNombre nuevoEstado, String nota) {

        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id " + usuarioId));
        var libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id " + libroId));

        var usuarioLibro = usuarioLibroRepository.findByUsuarioAndLibro(usuario, libro)
                .orElseThrow(() -> new RuntimeException("El libro no está en la biblioteca del usuario"));

        var estado = estadoRepository.findByNombre(nuevoEstado)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + nuevoEstado));

        UsuarioLibroEstado ule = new UsuarioLibroEstado();
        ule.setUsuarioLibro(usuarioLibro);
        ule.setEstado(estado);
        ule.setNotaPersonal(nota);

        return usuarioLibroEstadoRepository.save(ule);
    }

    @Override
    public UsuarioLibroEstado obtenerUltimoEstado(Long usuarioId, Long libroId) {
        try {
            var usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id " + usuarioId));
            var libro = libroRepository.findById(libroId)
                    .orElseThrow(() -> new RuntimeException("Libro no encontrado con id " + libroId));

            var usuarioLibro = usuarioLibroRepository.findByUsuarioAndLibro(usuario, libro)
                    .orElseThrow(() -> new RuntimeException("El libro no está en la biblioteca del usuario"));

            return usuarioLibroEstadoRepository
                    .findFirstByUsuarioLibroOrderByFechaEstadoDesc(usuarioLibro)
                    .orElse(null);

        } catch (Exception e) {
            System.err.println("Error obteniendo último estado: " + e.getMessage());
            return null;
        }
    }

    @Override
    public boolean existeEnBiblioteca(Long usuarioId, Long libroId) {
        return usuarioLibroRepository.existsByUsuarioIdAndLibroId(usuarioId, libroId);
    }
}