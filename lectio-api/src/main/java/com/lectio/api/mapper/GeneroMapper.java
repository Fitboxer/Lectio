package com.lectio.api.mapper;

import com.lectio.api.dto.GeneroDTO;
import com.lectio.api.model.Genero;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class GeneroMapper {

    private final ModelMapper modelMapper;

    public GeneroMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public GeneroDTO toDTO(Genero genero) {
        return modelMapper.map(genero, GeneroDTO.class);
    }

    public Genero toEntity(GeneroDTO dto) {
        return modelMapper.map(dto, Genero.class);
    }
}
