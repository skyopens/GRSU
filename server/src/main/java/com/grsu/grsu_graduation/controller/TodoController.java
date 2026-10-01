package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.entity.Todo;
import com.grsu.grsu_graduation.repository.TodoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import jakarta.validation.Valid;
import com.grsu.grsu_graduation.common.ApisResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/apis/todos")
@CrossOrigin(origins = "*")
public class TodoController {
    private final TodoRepository todoRepository;

    public TodoController(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @GetMapping
    public ResponseEntity<ApisResponse<List<Todo>>> getAllTodos() {
        List<Todo> todos = todoRepository.findAll();
        return ResponseEntity.ok(new ApisResponse<>(200, todos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApisResponse<Todo>> getTodoById(@PathVariable Long id) {
        Todo todo = todoRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(new ApisResponse<>(200, todo));
    }

    @PostMapping
    public ResponseEntity<ApisResponse<Todo>> createTodo(@Valid @RequestBody Todo todo) {
        todo.setId(null);
        todo.setDate(null);
        Todo savedTodo = todoRepository.save(todo);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApisResponse<>(201, savedTodo));
    }

    @PutMapping
    public ResponseEntity<ApisResponse<Todo>> updateTodo(@Valid @RequestBody Todo updatedTodo) {
        Todo todo = todoRepository.findById(updatedTodo.getId()).orElseThrow();

        todo.setTitle(updatedTodo.getTitle());
        todo.setDetail(updatedTodo.getDetail());
        todo.setCategory(updatedTodo.getCategory());
        todo.setStatus(updatedTodo.getStatus());
        todo.setLabel(updatedTodo.getLabel());

        Todo savedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(new ApisResponse<>(200, savedTodo));
    }

    @DeleteMapping
    public ResponseEntity<ApisResponse<String>> deleteTodo(@RequestBody List<Long> ids) {
        todoRepository.deleteAllById(ids);
        return ResponseEntity.ok(new ApisResponse<>(200, "deleted successfully"));
    }
}