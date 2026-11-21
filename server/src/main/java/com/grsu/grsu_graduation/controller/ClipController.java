package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.common.ApisResponse;
import com.grsu.grsu_graduation.common.QuerySupport;
import com.grsu.grsu_graduation.common.StatusCode;
import com.grsu.grsu_graduation.dto.ClipQuery;
import com.grsu.grsu_graduation.entity.ClipVideo;
import com.grsu.grsu_graduation.repository.ClipVideoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.JsonNodeFactory;
import tools.jackson.databind.node.ObjectNode;

import java.util.List;

/*
    The clip list is returned as plain JSON, not as a ciphertext envelope: the payload is parsed and flattened
    so the frontend receives one object per clip instead of the raw payload string.
*/
@RestController
@RequestMapping("/apis/clips")
public class ClipController {
    private final ClipVideoRepository repository;
    private final ObjectMapper mapper;

    public ClipController(ClipVideoRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<ApisResponse<Object>> getClips(ClipQuery queries) {
        String namePath = "$.title." + QuerySupport.resolveLang(queries.getLang());
        String kw = QuerySupport.likeKeyword(queries.getSearch());
        List<ClipVideo> rows = repository.findList(queries.getCategory(), namePath, kw);
        ResponseEntity<ApisResponse<Object>> result = ResponseEntity.ok(
            new ApisResponse<>(StatusCode.OKAY, flatten(rows))
        );

        return result;
    }

    // id and category come from the columns, every other field is already inside the payload
    private ArrayNode flatten(List<ClipVideo> rows) {
        ArrayNode array = JsonNodeFactory.instance.arrayNode();

        for (ClipVideo row : rows) {
            ObjectNode node = (ObjectNode) mapper.readTree(row.getPayload()); // to JSON
            node.put("id", row.getId());
            node.put("category", row.getCategory());
            array.add(node);
        }

        return array;
    }
}
