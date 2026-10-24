package com.grsu.grsu_graduation.dto;

/**
 * Ciphertext envelope, mapping one-to-one to the input of decryptStore in the frontend store_service.ts.
 * The field names must stay iv / data, because the frontend decrypts with {iv, data} directly.
 */
public class EncryptedPayload {
    private String iv;
    private String data;

    public EncryptedPayload() {
    }

    public EncryptedPayload(String iv, String data) {
        this.iv = iv;
        this.data = data;
    }

    public String getIv() {
        return iv;
    }

    public void setIv(String iv) {
        this.iv = iv;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}