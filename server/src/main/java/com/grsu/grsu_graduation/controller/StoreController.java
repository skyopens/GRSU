package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.common.ApisResponse;
import com.grsu.grsu_graduation.common.StatusCode;
import com.grsu.grsu_graduation.dto.StoreItemsQuery;
import com.grsu.grsu_graduation.entity.StoreItem;
import com.grsu.grsu_graduation.entity.StoreSub;
import com.grsu.grsu_graduation.repository.StoreItemRepository;
import com.grsu.grsu_graduation.repository.StoreSubRepository;
import com.grsu.grsu_graduation.service.StoreQueryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

// On success data is a ciphertext message; on failure data is a plaintext error message, and the frontend decides by status.
@RestController
@RequestMapping("/apis/store")
@CrossOrigin(origins = "*")
public class StoreController {
    private static final int MAX_PAGE_SIZE = 200;

    private final StoreSubRepository subRepository;
    private final StoreItemRepository itemRepository;
    private final StoreQueryService queryService;

    public StoreController(
        StoreSubRepository subRepository,
        StoreItemRepository itemRepository,
        StoreQueryService queryService
    ) {
        this.subRepository = subRepository;
        this.itemRepository = itemRepository;
        this.queryService = queryService;
    }

    // List of second-level categories. After decryption data is IStoreSub[], with an empty data array on each entry.
    @GetMapping("/subs")
    public ResponseEntity<ApisResponse<Object>> getSubs(@RequestParam("tab") String tab) {
        List<StoreSub> subs = subRepository.findByTabKeyOrderBySortOrderAsc(tab);
        ResponseEntity<ApisResponse<Object>> result;

        if (subs.isEmpty()) {
            result = ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApisResponse<>(StatusCode.DATA_NOT_FOUND, "一级分类不存在：" + tab));
        } else {
            result = ResponseEntity.ok(new ApisResponse<>(StatusCode.OKAY, queryService.encryptSubs(subs)));
        }

        return result;
    }

    // One page of items of a second-level category. After decryption data is {items, total}.
    @GetMapping("/items")
    public ResponseEntity<ApisResponse<Object>> getItems(StoreItemsQuery queries) {
        ResponseEntity<ApisResponse<Object>> result;

        if (queries.getPageSize() < 1 || queries.getPageSize() > MAX_PAGE_SIZE) {
            result = ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApisResponse<>(StatusCode.BAD_REQUEST, "pageSize 必须在 1.." + MAX_PAGE_SIZE));
        } else if (queries.getCurrentPage() < 1) {
            result = ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApisResponse<>(StatusCode.BAD_REQUEST, "currentPage 必须大于等于 1"));
        } else {
            StoreSub subRow = subRepository.findByTabKeyAndSubKey(queries.getTab(), queries.getSub()).orElse(null);

            if (subRow == null) {
                result = ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApisResponse<>(StatusCode.DATA_NOT_FOUND,
                        "二级分类不存在：" + queries.getTab() + "/" + queries.getSub()));
            } else {
                long total = itemRepository.countBySubId(subRow.getId());
                long maxPage = total == 0 ? 1 : Math.ceilDiv(total, queries.getPageSize());

                // The category exists but the page is out of range: the request itself is fine, so HTTP 200,
                // and status tells the frontend "the page is too high, data is not missing"
                if (queries.getCurrentPage() > maxPage) {
                    result = ResponseEntity.ok(new ApisResponse<>(StatusCode.PAGE_OUT_OF_RANGE,
                        queryService.encryptPage(Collections.<StoreItem>emptyList(), total)));
                } else {
                    Page<StoreItem> page = itemRepository.findBySubId(subRow.getId(),
                        PageRequest.of(queries.getCurrentPage() - 1, queries.getPageSize(),
                            Sort.by(Sort.Direction.ASC, "sortOrder")));

                    result = ResponseEntity.ok(new ApisResponse<>(StatusCode.OKAY,
                        queryService.encryptPage(page.getContent(), total)));
                }
            }
        }
        return result;
    }
}