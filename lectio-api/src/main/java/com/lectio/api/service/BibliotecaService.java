package com.lectio.api.service;

import com.lectio.api.model.*;

import java.util.List;

public interface BibliotecaService {

    UsuarioLibro agregarLibroAUsuario(Long usuarioId, Long libroId);

    void eliminarLibroDeUsuario(Long usuarioId, Long libroId);

    List<UsuarioLibro> obtenerBibliotecaUsuario(Long usuarioId);

    UsuarioLibroEstado cambiarEstadoDeLibro(Long usuarioId, Long libroId, Estado.EstadoNombre nuevoEstado, String nota);

    UsuarioLibroEstado obtenerUltimoEstado(Long usuarioId, Long libroId);

    boolean existeEnBiblioteca(Long usuarioId, Long libroId);
}
