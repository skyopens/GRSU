package com.grsu.grsu_graduation.dto;

/**
 * Query parameters for the store item list.
 * Spring binds ?tab=&sub=&pageSize=&currentPage= onto this object automatically,
 * which is the same shape as the queries passed by getData in the frontend apis/store.ts.
 */
public class StoreItemsQuery {
    private String tab;
    private String sub;
    private int pageSize = 20;
    private int currentPage = 1;

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
}