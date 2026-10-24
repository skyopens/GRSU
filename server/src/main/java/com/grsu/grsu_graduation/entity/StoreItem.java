package com.grsu.grsu_graduation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * A store item. payload holds the raw JSON of a single item (picture / name / desc / amount / unit / price_*),
 * stored as plaintext; picture holds the original relative path (e.g. decoration/sugar_bubbles/1.png)
 * and is hashed with storeSalt when it goes out through the API.
 */
@Entity
@Table(name = "store_item", indexes = {
    @Index(name = "idx_store_item_sub", columnList = "sub_id, sort_order")
})
public class StoreItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sub_id", nullable = false)
    private Long subId;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    public StoreItem() {
    }

    public StoreItem(Long subId, Integer sortOrder, String payload) {
        this.subId = subId;
        this.sortOrder = sortOrder;
        this.payload = payload;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSubId() {
        return subId;
    }

    public void setSubId(Long subId) {
        this.subId = subId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}