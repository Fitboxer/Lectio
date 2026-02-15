package com.lectio.api.controller;

import com.lectio.api.dto.UsuarioDTO;
import com.lectio.api.service.AdminUsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "*")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping
    public List<UsuarioDTO> listar() {
        return adminUsuarioService.listarUsuarios().stream()
                .map(UsuarioDTO::fromEntity)
                .toList();
    }

    @PostMapping("/{id}/ban")
    public UsuarioDTO banear(@PathVariable Long id) {
        return UsuarioDTO.fromEntity(adminUsuarioService.banearUsuario(id));
    }

    @PostMapping("/{id}/unban")
    public UsuarioDTO desbanear(@PathVariable Long id) {
        return UsuarioDTO.fromEntity(adminUsuarioService.desbanearUsuario(id));
    }
}
