package com.grsu.grsu_graduation.repository;

import com.grsu.grsu_graduation.entity.ClipVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClipVideoRepository extends JpaRepository<ClipVideo, Long> {
    // An empty category matches every row; the title search reuses the same escaped LIKE as the store.
    String FILTER = " FROM clip_video"
        + " WHERE (:category = '' OR category = :category)"
        + " AND json_extract(payload, :namePath) LIKE :kw ESCAPE '\\'";

    @Query(
        value = "SELECT *" + FILTER + " ORDER BY sort_order ASC",
        nativeQuery = true
    )
    List<ClipVideo> findList(
        @Param("category") String category,
        @Param("namePath") String namePath,
        @Param("kw") String kw
    );
}