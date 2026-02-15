package com.lectio.api.mapper;

import com.lectio.api.dto.AutorDTO;
import com.lectio.api.model.Autor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AutorMapper {

    private final ModelMapper modelMapper;

    public AutorMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public AutorDTO toDTO(Autor autor) {
        return modelMapper.map(autor, AutorDTO.class);
    }

    public Autor toEntity(AutorDTO dto) {
        return modelMapper.map(dto, Autor.class);
    }
}
