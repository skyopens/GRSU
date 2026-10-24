package com.grsu.grsu_graduation.common;

public class ApisResponse<T> {
    private StatusCode status;
    private T data;

    public ApisResponse() {
    }

    public ApisResponse(StatusCode status, T data) {
        this.status = status;
        this.data = data;
    }

    public StatusCode getStatus() {
        return status;
    }

    public void setStatus(StatusCode status) {
        this.status = status;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}