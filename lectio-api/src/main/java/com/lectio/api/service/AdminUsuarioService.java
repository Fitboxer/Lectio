package com.lectio.api.service;

import com.lectio.api.model.Usuario;
import com.lectio.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;

    public AdminUsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario banearUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setBanned(true);
        return usuarioRepository.save(u);
    }

    public Usuario desbanearUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setBanned(false);
        return usuarioRepository.save(u);
    }
}
