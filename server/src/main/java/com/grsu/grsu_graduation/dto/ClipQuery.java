package com.grsu.grsu_graduation.dto;

/**
 * Query parameters for the clip list.
 * Spring binds ?category=&search=&lang= onto this object automatically, which is the same shape as the
 * queries passed by getClips in the frontend apis/clip.ts.
 * category / search / lang are optional: the defaults below mean "all categories, no filter, Chinese".
 */
public class ClipQuery {
    private String category = "";
    private String search = "";
    private String lang = "zh_CN";

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }
}