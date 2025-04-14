package com.hufds.service;

import com.hufds.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final JwtService jwtService;
    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Token'ı karaliste olarak işaretler
     */
    public void blacklistToken(String token) {
        // Token'ın süresinin dolacağı tarihi alıyoruz
        Date expiryDate = jwtService.extractExpiration(token);
        blacklistedTokens.put(token, expiryDate);

        // Periyodik olarak temizlemek için bir yöntem gerekebilir
        cleanupExpiredTokens();
    }

    /**
     * Token'ın karalistede olup olmadığını kontrol eder
     */
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    /**
     * Süresi dolmuş token'ları karaliste'den temizler
     */
    private void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}