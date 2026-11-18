package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.entity.GameRole;
import com.grsu.grsu_graduation.repository.GameRoleRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only list of the game roles shown on the character introduction page. That page still reads
 * its text from the language files, so nothing calls this endpoint yet; writing belongs to the
 * administration channel.
 */
@RestController
@RequestMapping("/apis/roles")
public class GameRoleController {

    private final GameRoleRepository repository;

    public GameRoleController(GameRoleRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<GameRole> getAllRoles() {
        return repository.findAll(Sort.by("sortOrder"));
    }
}
