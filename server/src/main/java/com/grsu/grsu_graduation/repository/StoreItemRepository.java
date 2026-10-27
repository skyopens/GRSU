package com.grsu.grsu_graduation.repository;

import com.grsu.grsu_graduation.entity.StoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// name and price are inside the payload JSON, so json_extract is the only way to filter or sort on them.
public interface StoreItemRepository extends JpaRepository<StoreItem, Long> {
    String FILTER = " FROM store_item WHERE sub_id = :subId"
        + " AND json_extract(payload, :namePath) LIKE :keyword ESCAPE '\\'";

    @Query(
        value = "SELECT *" + FILTER
            + " ORDER BY sort_order ASC"
            + " LIMIT :size OFFSET :offset",
        nativeQuery = true
    )
    List<StoreItem> findPageDefault(
        @Param("subId") Long subId,
        @Param("namePath") String namePath,
        @Param("keyword") String keyword,
        @Param("size") int size,
        @Param("offset") int offset
    );

    @Query(
        value = "SELECT *" + FILTER
            + " ORDER BY json_extract(payload, :namePath) ASC, sort_order ASC"
            + " LIMIT :size OFFSET :offset",
        nativeQuery = true
    )
    List<StoreItem> findPageByName(
        @Param("subId") Long subId,
        @Param("namePath") String namePath,
        @Param("keyword") String keyword,
        @Param("size") int size,
        @Param("offset") int offset
    );

    @Query(
        value = "SELECT *" + FILTER
            + " ORDER BY CAST(json_extract(payload, '$.price_normal') AS REAL) ASC, sort_order ASC"
            + " LIMIT :size OFFSET :offset",
        nativeQuery = true
    )
    List<StoreItem> findPageByPriceAsc(
        @Param("subId") Long subId,
        @Param("namePath") String namePath,
        @Param("keyword") String keyword,
        @Param("size") int size,
        @Param("offset") int offset
    );

    @Query(
        value = "SELECT *" + FILTER
            + " ORDER BY CAST(json_extract(payload, '$.price_normal') AS REAL) DESC, sort_order ASC"
            + " LIMIT :size OFFSET :offset",
        nativeQuery = true
    )
    List<StoreItem> findPageByPriceDesc(
        @Param("subId") Long subId,
        @Param("namePath") String namePath,
        @Param("keyword") String keyword,
        @Param("size") int size,
        @Param("offset") int offset
    );

    // the total is the number of matches, not the number of rows in the category
    @Query(value = "SELECT COUNT(*)" + FILTER, nativeQuery = true)
    long countPage(@Param("subId") Long subId, @Param("namePath") String namePath, @Param("keyword") String keyword);
}