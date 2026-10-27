package com.grsu.grsu_graduation.dto;

/**
 * Query parameters for the store item list.
 * Spring binds ?tab=&sub=&pageSize=&currentPage=&search=&orderBy=&lang= onto this object automatically,
 * which is the same shape as the queries passed by getData in the frontend apis/store.ts.
 * search / orderBy / lang are optional: the defaults below mean "no filter, default order, Chinese".
 */
public class StoreItemsQuery {
    private String tab;
    private String sub;
    private int pageSize = 20;
    private int currentPage = 1;
    private String search = "";
    private String orderBy = "default";
    private String lang = "zh_CN";

    public String getTab() {
        return tab;
    }

    public void setTab(String tab) {
        this.tab = tab;
    }

    public String getSub() {
        return sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }
}