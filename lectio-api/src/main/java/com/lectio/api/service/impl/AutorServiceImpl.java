package com.lectio.api.service.impl;

import com.lectio.api.model.Autor;
import com.lectio.api.repository.AutorRepository;
import com.lectio.api.service.AutorService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AutorServiceImpl implements AutorService {

    private final AutorRepository autorRepository;

    public AutorServiceImpl(AutorRepository autorRepository) {
        this.autorRepository = autorRepository;
    }

    @Override
    public List<Autor> findAll() {
        return autorRepository.findAll();
    }

    @Override
    public Optional<Autor> findById(Long id) {
        return autorRepository.findById(id);
    }

    @Override
    public List<Autor> buscarPorNombre(String nombre) {
        return autorRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public Autor save(Autor autor) {
        return autorRepository.save(autor);
    }

    @Override
    public Autor update(Long id, Autor autorActualizado) {
        return autorRepository.findById(id)
                .map(autor -> {
                    autor.setNombre(autorActualizado.getNombre());
                    return autorRepository.save(autor);
                })
                .orElseThrow(() -> new RuntimeException("Autor no encontrado con id: " + id));
    }

    @Override
    public void deleteById(Long id) {
        if (!autorRepository.existsById(id)) {
            throw new RuntimeException("Autor no encontrado con id " + id);
        }
        autorRepository.deleteById(id);
    }
}
