package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.entity.Role;
import com.grsu.grsu_graduation.repository.RoleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/users")
public class RoleController {

    private final RoleRepository userRepository;

    public RoleController(RoleRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Role> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public Role createUser(@RequestBody Role user) {
        return userRepository.save(user);
    }
}