package com.grsu.grsu_graduation.dto;

import java.util.List;

/**
 * Paged response body, mapping one-to-one to IPage&lt;T&gt; in the frontend data/api_service.ts.
 */
public class PageDto<T> {
    private List<T> items;
    private long total;

    public PageDto() {
    }

    public PageDto(List<T> items, long total) {
        this.items = items;
        this.total = total;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}