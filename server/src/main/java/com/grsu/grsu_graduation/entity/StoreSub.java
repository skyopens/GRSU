package com.grsu.grsu_graduation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A second-level store category. payload holds the raw JSON of that category ({"key":...,"title":{four languages}}),
 * stored as plaintext; an empty data array is appended when it is read back.
 */
@Entity
@Table(name = "store_sub")
public class StoreSub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tab_key", nullable = false, length = 32)
    private String tabKey;

    @Column(name = "sub_key", nullable = false, length = 32)
    private String subKey;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    public StoreSub() {
    }

    public StoreSub(String tabKey, String subKey, Integer sortOrder, String payload) {
        this.tabKey = tabKey;
        this.subKey = subKey;
        this.sortOrder = sortOrder;
        this.payload = payload;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTabKey() {
        return tabKey;
    }

    public void setTabKey(String tabKey) {
        this.tabKey = tabKey;
    }

    public String getSubKey() {
        return subKey;
    }

    public void setSubKey(String subKey) {
        this.subKey = subKey;
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