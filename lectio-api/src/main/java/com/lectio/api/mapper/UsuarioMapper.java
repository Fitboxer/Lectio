package com.lectio.api.mapper;

import com.lectio.api.dto.UsuarioDTO;
import com.lectio.api.model.Rol;
import com.lectio.api.model.Usuario;
import com.lectio.api.repository.RolRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    private final ModelMapper modelMapper;
    private final RolRepository rolRepository;

    public UsuarioMapper(ModelMapper modelMapper, RolRepository rolRepository) {
        this.modelMapper = modelMapper;
        this.rolRepository = rolRepository;
    }

    public UsuarioDTO toDTO(Usuario usuario) {
        Long rolId = usuario.getRol() != null ? usuario.getRol().getId() : null;

        return new UsuarioDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getFechaNac(),
                usuario.getImagen(),
                rolId,
                usuario.isBanned(),
                usuario.getCreadoEn()
        );
    }

    public Usuario toEntity(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setId(dto.id());
        usuario.setEmail(dto.email());
        usuario.setNombre(dto.nombre());
        usuario.setFechaNac(dto.fechaNac());
        usuario.setImagen(dto.imagen());
        usuario.setBanned(dto.banned());
        usuario.setCreadoEn(dto.creadoEn());

        if (dto.rolId() != null) {
            Rol rol = rolRepository.findById(dto.rolId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado con id " + dto.rolId()));
            usuario.setRol(rol);
        }

        return usuario;
    }
}
