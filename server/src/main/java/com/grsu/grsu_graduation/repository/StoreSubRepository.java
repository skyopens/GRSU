package com.grsu.grsu_graduation.repository;

import com.grsu.grsu_graduation.entity.StoreSub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreSubRepository extends JpaRepository<StoreSub, Long> {
    List<StoreSub> findByTabKeyOrderBySortOrderAsc(String tabKey);

    Optional<StoreSub> findByTabKeyAndSubKey(String tabKey, String subKey);
}