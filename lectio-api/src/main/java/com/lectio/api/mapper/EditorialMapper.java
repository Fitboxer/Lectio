package com.lectio.api.mapper;

import com.lectio.api.dto.EditorialDTO;
import com.lectio.api.model.Editorial;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class EditorialMapper {

    private final ModelMapper modelMapper;

    public EditorialMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public EditorialDTO toDTO(Editorial editorial) {
        return modelMapper.map(editorial, EditorialDTO.class);
    }

    public Editorial toEntity(EditorialDTO dto) {
        return modelMapper.map(dto, Editorial.class);
    }
}
