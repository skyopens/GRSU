package com.grsu.grsu_graduation.service;

import com.grsu.grsu_graduation.dto.EncryptedPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Encryption/decryption and picture renaming for the store. The parameters must match client/tool/protect.cjs exactly:
 *   key       = sha256(storeKey), 32 bytes, used directly as the raw AES-256 key
 *   text      = AES-256-GCM, random 12-byte IV, 16-byte auth tag at the end of the ciphertext, standard base64
 *   file name = first 16 chars of sha256hex(storeSalt + "store/" + original relative path) + original extension
 */
@Component
public class StoreCipher {
    private static final int IV_LEN = 12;
    private static final int TAG_BITS = 128;
    private static final String PICTURE_PREFIX = "store/";

    private final SecureRandom random = new SecureRandom();
    private final SecretKeySpec key;
    private final String salt;

    public StoreCipher(@Value("${store.key}") String storeKey, @Value("${store.salt}") String storeSalt) {
        this.key = new SecretKeySpec(sha256(storeKey), "AES");
        this.salt = storeSalt;
    }

    /**
     * Plaintext -> {iv, data}. The format matches the ciphertext files produced by protect.cjs,
     * so the frontend decryptStore needs no change at all.
     */
    public EncryptedPayload encrypt(String plain) {
        byte[] iv = new byte[IV_LEN];
        random.nextBytes(iv);

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            // doFinal already appends the 16-byte GCM auth tag, which is exactly what Web Crypto expects on decrypt
            byte[] body = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            return new EncryptedPayload(base64(iv), base64(body));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("商城数据加密失败", ex);
        }
    }

    /**
     * Original relative path -> hashed name. Same rule as hashName in protect.cjs:
     * the input is salt + "store/" + relative path, take the first 16 hex chars of sha256, keep the extension.
     * For example pet/skill/1.png -> pet/skill/ee6eded97ca6165b.png
     */
    public String hashPicture(String relPath) {
        String hashed = hex(sha256(salt + PICTURE_PREFIX + relPath)).substring(0, 16);
        int slash = relPath.lastIndexOf('/');
        int dot = relPath.lastIndexOf('.');
        String dir = slash < 0 ? "" : relPath.substring(0, slash + 1);
        String ext = dot > slash ? relPath.substring(dot) : "";
        return dir + hashed + ext;
    }

    private static byte[] sha256(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("找不到 SHA-256 算法", ex);
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte one : bytes) {
            builder.append(Character.forDigit((one >> 4) & 0xF, 16));
            builder.append(Character.forDigit(one & 0xF, 16));
        }
        return builder.toString();
    }

    private static String base64(byte[] bytes) {
        return Base64.getEncoder().encodeToString(bytes);
    }
}