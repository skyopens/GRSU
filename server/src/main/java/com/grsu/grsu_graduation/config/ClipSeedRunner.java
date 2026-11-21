package com.grsu.grsu_graduation.config;

import com.grsu.grsu_graduation.entity.ClipVideo;
import com.grsu.grsu_graduation.repository.ClipVideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.File;

/**
 * Seeds the plaintext clip list under client/data_raw/data_clip/clip.json into SQLite on startup.
 * Runs only when clip_video is empty, so restarting never inserts duplicates.
 * The array order of the source file becomes sort_order.
 */
@Component
public class ClipSeedRunner implements CommandLineRunner {
    private static final Logger LOG = LoggerFactory.getLogger(ClipSeedRunner.class);

    private final ClipVideoRepository repository;
    private final ObjectMapper mapper;
    private final String seedFile;

    public ClipSeedRunner(
        ClipVideoRepository repository,
        ObjectMapper mapper,
        @Value("${clip.seed-file}") String seedFile
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.seedFile = seedFile;
    }

    @Override
    @Transactional
    public void run(String... args) {
        File file = new File(seedFile);

        if (repository.count() > 0) {
            LOG.info("[clip-seed] 库里已有数据，跳过");
        } else if (!file.isFile()) {
            LOG.warn("[clip-seed] 跳过：找不到 {}", file.getAbsolutePath());
        } else {
            JsonNode clips = mapper.readTree(file);
            int order = 0;
            int count = 0;

            for (JsonNode clip : clips) {
                repository.save(new ClipVideo(clip.get("category").asString(), order++, mapper.writeValueAsString(clip)));
                count++;
            }

            LOG.info("[clip-seed] 完成：{} 条视频", count);
        }
    }
}