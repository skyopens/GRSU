package com.grsu.grsu_graduation.config;

import com.grsu.grsu_graduation.entity.StoreItem;
import com.grsu.grsu_graduation.entity.StoreSub;
import com.grsu.grsu_graduation.repository.StoreItemRepository;
import com.grsu.grsu_graduation.repository.StoreSubRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the plaintext JSON under client/data_raw/data_store/*.json into SQLite on startup.
 * Runs only when store_sub is empty, so restarting never inserts duplicates.
 * payload holds the original JSON text, and picture keeps the original relative path
 * (the hashed name is computed by the API layer).
 */
@Component
public class StoreSeedRunner implements CommandLineRunner {
    private static final Logger LOG = LoggerFactory.getLogger(StoreSeedRunner.class);
    private static final String[] TAB_KEYS = {"function", "decoration", "gear", "pet"};

    private final StoreSubRepository subRepository;
    private final StoreItemRepository itemRepository;
    private final ObjectMapper mapper;
    private final String seedDir;

    public StoreSeedRunner(
        StoreSubRepository subRepository,
        StoreItemRepository itemRepository,
        ObjectMapper mapper,
        @Value("${store.seed-dir}") String seedDir
    ) {
        this.subRepository = subRepository;
        this.itemRepository = itemRepository;
        this.mapper = mapper;
        this.seedDir = seedDir;
    }

    @Override
    @Transactional
    public void run(String... args) {
        File dir = new File(seedDir);

        if (subRepository.count() > 0) {
            LOG.info("[store-seed] 库里已有数据，跳过");
        } else if (!dir.isDirectory()) {
            LOG.warn("[store-seed] 跳过：找不到目录 {}", dir.getAbsolutePath());
        } else {
            int subCount = 0;
            int itemCount = 0;

            for (String tab : TAB_KEYS) {
                File file = new File(dir, tab + ".json");

                if (file.isFile()) {
                    JsonNode subs = mapper.readTree(file);
                    int subOrder = 0;

                    for (JsonNode sub : subs) {
                        StoreSub row = subRepository.save(
                            new StoreSub(tab, sub.get("key").asString(), subOrder++, subPayload(sub)));

                        List<StoreItem> items = new ArrayList<>();
                        int itemOrder = 0;
                        for (JsonNode item : sub.get("data")) {
                            items.add(new StoreItem(row.getId(), itemOrder++, mapper.writeValueAsString(item)));
                        }
                        itemRepository.saveAll(items);

                        subCount++;
                        itemCount += items.size();
                    }
                } else {
                    LOG.warn("[store-seed] 跳过：找不到 {}", file.getAbsolutePath());
                }
            }

            LOG.info("[store-seed] 完成：{} 个二级分类，{} 条道具", subCount, itemCount);
        }
    }

    // Keep only key + title; the API layer appends an empty data array.
    private String subPayload(JsonNode sub) {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.set("key", sub.get("key"));
        node.set("title", sub.get("title"));
        return mapper.writeValueAsString(node);
    }
}