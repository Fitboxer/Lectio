package com.lectio.api.service.impl;

import com.lectio.api.model.Editorial;
import com.lectio.api.repository.EditorialRepository;
import com.lectio.api.service.EditorialService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EditorialServiceImpl implements EditorialService {

    private final EditorialRepository editorialRepository;

    public EditorialServiceImpl(EditorialRepository editorialRepository) {
        this.editorialRepository = editorialRepository;
    }

    @Override
    public List<Editorial> findAll() {
        return editorialRepository.findAll();
    }

    @Override
    public Optional<Editorial> findById(Long id) {
        return editorialRepository.findById(id);
    }

    @Override
    public List<Editorial> buscarPorNombre(String nombre) {
        return editorialRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public Editorial save(Editorial editorial) {
        return editorialRepository.save(editorial);
    }

    @Override
    public Editorial update(Long id, Editorial editorialActualizada) {
        return editorialRepository.findById(id)
                .map(e -> {
                    e.setNombre(editorialActualizada.getNombre());
                    e.setPais(editorialActualizada.getPais());
                    e.setSitioWeb(editorialActualizada.getSitioWeb());
                    return editorialRepository.save(e);
                })
                .orElseThrow(() -> new RuntimeException("Editorial no encontrada con id " + id));
    }

    @Override
    public void deleteById(Long id) {
        if (!editorialRepository.existsById(id)) {
            throw new RuntimeException("Editorial no encontrada con id " + id);
        }
        editorialRepository.deleteById(id);
    }
}
