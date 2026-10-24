package com.grsu.grsu_graduation.common;

// Data status code, serialized as a string for the frontend to read.
public enum StatusCode {
    // Success
    OKAY,
    // Invalid request parameters, HTTP 400
    BAD_REQUEST,
    // Data not found, HTTP 404
    DATA_NOT_FOUND,
    // Page out of range: the request itself is fine, the page just exceeds the total page count, HTTP 200
    PAGE_OUT_OF_RANGE,
    // Server error, HTTP 500
    INTERNAL_ERROR
}