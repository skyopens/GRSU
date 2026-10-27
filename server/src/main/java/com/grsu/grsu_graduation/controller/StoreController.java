package com.grsu.grsu_graduation.controller;

import com.grsu.grsu_graduation.common.ApisResponse;
import com.grsu.grsu_graduation.common.StatusCode;
import com.grsu.grsu_graduation.dto.StoreItemsQuery;
import com.grsu.grsu_graduation.entity.StoreItem;
import com.grsu.grsu_graduation.entity.StoreSub;
import com.grsu.grsu_graduation.repository.StoreItemRepository;
import com.grsu.grsu_graduation.repository.StoreSubRepository;
import com.grsu.grsu_graduation.service.StoreQueryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Set;

// On success data is a ciphertext message; on failure data is a plaintext error message, and the frontend decides by status.
@RestController
@RequestMapping("/apis/store")
@CrossOrigin(origins = "*")
public class StoreController {
    private static final int MAX_PAGE_SIZE = 200;
    private static final String DEFAULT_LANG = "zh_CN";
    private static final Set<String> SUPPORTED_LANGS = Set.of("zh_CN", "en_US", "ru_RU", "be_BY");

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
            result = ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApisResponse<>(StatusCode.DATA_NOT_FOUND, "一级分类不存在：" + tab)
            );
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
            result = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ApisResponse<>(StatusCode.BAD_REQUEST, "pageSize 必须在 1.." + MAX_PAGE_SIZE)
            );
        } else if (queries.getCurrentPage() < 1) {
            result = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ApisResponse<>(StatusCode.BAD_REQUEST, "currentPage 必须大于等于 1")
            );
        } else {
            StoreSub subRow = subRepository.findByTabKeyAndSubKey(queries.getTab(), queries.getSub()).orElse(null);

            if (subRow == null) {
                result = ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApisResponse<>(StatusCode.DATA_NOT_FOUND, "二级分类不存在：" + queries.getTab() + "/" + queries.getSub())
                );
            } else {
                String namePath = "$.name." + resolveLang(queries.getLang());
                String kw = likeKeyword(queries.getSearch());
                long total = itemRepository.countPage(subRow.getId(), namePath, kw);
                long maxPage = total == 0 ? 1 : Math.ceilDiv(total, queries.getPageSize());

                /*
                    The category exists but the page is out of range: the request itself is fine, so HTTP 200,
                    and status tells the frontend "the page is too high, data is not missing"
                */
                if (queries.getCurrentPage() > maxPage) {
                    result = ResponseEntity.ok(new ApisResponse<>(
                        StatusCode.PAGE_OUT_OF_RANGE,
                        queryService.encryptPage(Collections.<StoreItem>emptyList(), total)
                    ));
                } else {
                    int offset = (queries.getCurrentPage() - 1) * queries.getPageSize();
                    List<StoreItem> rows = findPage(subRow.getId(), namePath, kw, queries.getPageSize(), offset, queries.getOrderBy());
                    result = ResponseEntity.ok(new ApisResponse<>(StatusCode.OKAY, queryService.encryptPage(rows, total)));
                }
            }
        }
        return result;
    }

    // An unknown language falls back to Chinese.
    private static String resolveLang(String lang) {
        String result = DEFAULT_LANG;

        if (SUPPORTED_LANGS.contains(lang)) {
            result = lang;
        }

        return result;
    }

    /*
        An empty search term becomes '%%', which matches everything
        and keeps the statements free of an extra "with or without search".
        Backslash, percent and underscore are escaped first
        so the user can literally search for those characters.
    */
    private static String likeKeyword(String search) {
        String keyword = search == null ? "" : search.trim();
        String result = "%%";

        if (!keyword.isEmpty()) {
            result = "%" + keyword.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        }

        return result;
    }

    // Only the four known keys pick a statement; anything else keeps the default order.
    private List<StoreItem> findPage(Long subId, String namePath, String kw, int size, int offset, String orderBy) {
        List<StoreItem> result;
        String sort = orderBy == null ? "" : orderBy;

        switch (sort) {
            case "name":
                result = itemRepository.findPageByName(subId, namePath, kw, size, offset);
                break;
            case "price_asc":
                result = itemRepository.findPageByPriceAsc(subId, namePath, kw, size, offset);
                break;
            case "price_desc":
                result = itemRepository.findPageByPriceDesc(subId, namePath, kw, size, offset);
                break;
            default:
                result = itemRepository.findPageDefault(subId, namePath, kw, size, offset);
                break;
        }
        return result;
    }
}