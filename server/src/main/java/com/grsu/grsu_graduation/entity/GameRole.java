package com.grsu.grsu_graduation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A game role shown on the character introduction page. payload holds the raw JSON of that role
 * ({"picture":..., "banners":[...], "name":{four languages}, "desc":{four languages}}), stored as
 * plaintext. The table is in place; the page and the API that read it are still under development.
 */
@Entity
@Table(name = "game_role")
public class GameRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    public GameRole() {
    }

    public GameRole(Integer sortOrder, String payload) {
        this.sortOrder = sortOrder;
        this.payload = payload;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
