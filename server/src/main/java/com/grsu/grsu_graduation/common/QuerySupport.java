package com.grsu.grsu_graduation.common;

import java.util.Set;

public final class QuerySupport {
    public static final String DEFAULT_LANG = "zh_CN";
    public static final Set<String> SUPPORTED_LANGS = Set.of("zh_CN", "en_US", "ru_RU", "be_BY");

    private QuerySupport() {
    }

    public static String resolveLang(String lang) {
        String result = "";
        if (SUPPORTED_LANGS.contains(lang)) {
            result = lang;
        } else {
            result = DEFAULT_LANG;
        }
        return result;
    }

    // An empty search term becomes '%%', which matches everything. Backslash, percent and underscore are escaped first.
    public static String likeKeyword(String search) {
        String keyword = search == null ? "" : search.trim();
        String result = "";
        if (!keyword.isEmpty()) {
            result = "%" + keyword.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        } else {
            result = "%%";
        }
        return result;
    }
}
