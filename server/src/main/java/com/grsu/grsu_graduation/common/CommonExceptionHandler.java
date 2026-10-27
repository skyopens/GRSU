package com.grsu.grsu_graduation.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// Global exception handler for Spring Boot.
@RestControllerAdvice
public class CommonExceptionHandler {
    // Parameter validation exception
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApisResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApisResponse<>(StatusCode.BAD_REQUEST, errors));
    }

    // Any other exception.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApisResponse<String>> handleException(Exception ex) {
        HttpStatusCode code = ex instanceof ErrorResponse ? ((ErrorResponse) ex).getStatusCode() : null;

        if (code != null && code.is4xxClientError()) {
            return ResponseEntity.status(code).body(new ApisResponse<>(StatusCode.BAD_REQUEST, "The request cannot be processed!"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApisResponse<>(StatusCode.INTERNAL_ERROR, "Internal Server Error!")
            );
        }
    }
}