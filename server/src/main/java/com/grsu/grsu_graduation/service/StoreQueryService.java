package com.grsu.grsu_graduation.service;

import com.grsu.grsu_graduation.dto.EncryptedPayload;
import com.grsu.grsu_graduation.dto.PageDto;
import com.grsu.grsu_graduation.entity.StoreItem;
import com.grsu.grsu_graduation.entity.StoreSub;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.List;

/**
 * Only assembles the plaintext payload read from the database into a response body and encrypts it.
 * It does not query the database and does not decide status codes; those live in the controller,
 * because they have to be decided together with the HTTP code.
 */
@Service
public class StoreQueryService {
    private final StoreCipher cipher;
    private final ObjectMapper mapper;

    public StoreQueryService(StoreCipher cipher, ObjectMapper mapper) {
        this.cipher = cipher;
        this.mapper = mapper;
    }

    /**
     * List of second-level categories. The payload already holds key + title, so an empty data array
     * is appended here to match the frontend IStoreSub shape.
     */
    public EncryptedPayload encryptSubs(List<StoreSub> subs) {
        ArrayNode array = JsonNodeFactory.instance.arrayNode();

        for (StoreSub sub : subs) {
            ObjectNode node = (ObjectNode) mapper.readTree(sub.getPayload());
            node.set("data", JsonNodeFactory.instance.arrayNode());
            array.add(node);
        }

        return cipher.encrypt(mapper.writeValueAsString(array));
    }

    /**
     * One page of items: deserialize each row -> rewrite picture from the original path to the hashed name
     * -> build {items, total} -> encrypt the whole thing.
     * Deserializing instead of string-replacing keeps this independent of the payload text format,
     * so a reformatted payload will not silently break it.
     */
    public EncryptedPayload encryptPage(List<StoreItem> items, long total) {
        List<JsonNode> nodes = new ArrayList<>(items.size());

        for (StoreItem item : items) {
            ObjectNode node = (ObjectNode) mapper.readTree(item.getPayload());
            JsonNode picture = node.get("picture");
            if (picture != null && picture.isTextual()) {
                node.put("picture", cipher.hashPicture(picture.asString()));
            }
            nodes.add(node);
        }

        return cipher.encrypt(mapper.writeValueAsString(new PageDto<>(nodes, total)));
    }
}