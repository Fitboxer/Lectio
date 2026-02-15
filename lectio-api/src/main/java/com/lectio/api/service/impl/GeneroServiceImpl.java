package com.lectio.api.service.impl;

import com.lectio.api.model.Genero;
import com.lectio.api.repository.GeneroRepository;
import com.lectio.api.service.GeneroService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GeneroServiceImpl implements GeneroService {

    private final GeneroRepository generoRepository;

    public GeneroServiceImpl(GeneroRepository generoRepository) {
        this.generoRepository = generoRepository;
    }

    @Override
    public List<Genero> findAll() {
        return generoRepository.findAll();
    }

    @Override
    public Optional<Genero> findById(Long id) {
        return generoRepository.findById(id);
    }

    @Override
    public Optional<Genero> findByNombre(String nombre) {
        return generoRepository.findByNombre(nombre);
    }

    @Override
    public Genero save(Genero genero) {
        return generoRepository.save(genero);
    }

    @Override
    public Genero update(Long id, Genero generoActualizado) {
        return generoRepository.findById(id)
                .map(g -> {
                    g.setNombre(generoActualizado.getNombre());
                    return generoRepository.save(g);
                })
                .orElseThrow(() -> new RuntimeException("Género no encontrado con id " + id));
    }

    @Override
    public void deleteById(Long id) {
        if (!generoRepository.existsById(id)) {
            throw new RuntimeException("Género no encontrado con id " + id);
        }
        generoRepository.deleteById(id);
    }
}
