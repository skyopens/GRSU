package com.grsu.grsu_graduation.repository;

import com.grsu.grsu_graduation.entity.StoreItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreItemRepository extends JpaRepository<StoreItem, Long> {
    Page<StoreItem> findBySubId(Long subId, Pageable pageable);

    long countBySubId(Long subId);
}