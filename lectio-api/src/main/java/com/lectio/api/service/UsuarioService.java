package com.lectio.api.service;

import com.lectio.api.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioService {

    List<Usuario> findAll();

    Optional<Usuario> findById(Long id);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByNombre(String nombre);

    Usuario save(Usuario usuario);

    Usuario update(Long id, Usuario usuarioActualizado);

    void deleteById(Long id);
}
