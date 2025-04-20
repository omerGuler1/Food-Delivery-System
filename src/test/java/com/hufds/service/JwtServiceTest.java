package com.hufds.service;

import com.hufds.exception.CustomException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.lang.reflect.Field;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final Integer TEST_USER_ID = 1;
    private static final String TEST_USER_TYPE = "customer";
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 86400000; // 24 hours

    @BeforeEach
    void setUp() throws Exception {
        // Set private fields using reflection
        Field secretKeyField = JwtService.class.getDeclaredField("secretKey");
        secretKeyField.setAccessible(true);
        secretKeyField.set(jwtService, SECRET_KEY);

        Field expirationField = JwtService.class.getDeclaredField("jwtExpiration");
        expirationField.setAccessible(true);
        expirationField.set(jwtService, EXPIRATION);
    }

    @Test
    void generateToken_ShouldGenerateValidToken() {
        // Act
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Assert
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void extractEmail_ShouldExtractEmailFromToken() {
        // Arrange
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Act
        String extractedEmail = jwtService.extractEmail(token);

        // Assert
        assertEquals(TEST_EMAIL, extractedEmail);
    }

    @Test
    void extractUserId_ShouldExtractUserIdFromToken() {
        // Arrange
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Act
        Integer extractedUserId = jwtService.extractUserId(token);

        // Assert
        assertEquals(TEST_USER_ID, extractedUserId);
    }

    @Test
    void extractUserType_ShouldExtractUserTypeFromToken() {
        // Arrange
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Act
        String extractedUserType = jwtService.extractUserType(token);

        // Assert
        assertEquals(TEST_USER_TYPE, extractedUserType);
    }

    @Test
    void isTokenValid_ShouldReturnTrueForValidToken() {
        // Arrange
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Act
        boolean isValid = jwtService.isTokenValid(token, TEST_EMAIL);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_ShouldReturnFalseForInvalidEmail() {
        // Arrange
        String token = jwtService.generateToken(TEST_EMAIL, TEST_USER_ID, TEST_USER_TYPE);

        // Act
        boolean isValid = jwtService.isTokenValid(token, "wrong@email.com");

        // Assert
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_ShouldThrowExceptionForExpiredToken() {
        // Arrange
        Map<String, Object> claims = new HashMap<>();
        claims.put("user_id", TEST_USER_ID);
        claims.put("user_type", TEST_USER_TYPE);
        
        // Create an expired token
        String expiredToken = Jwts.builder()
                .setClaims(claims)
                .setSubject(TEST_EMAIL)
                .setIssuedAt(new Date(System.currentTimeMillis() - EXPIRATION - 1000))
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // Act & Assert
        assertThrows(CustomException.class, () -> jwtService.isTokenValid(expiredToken, TEST_EMAIL));
    }

    @Test
    void isTokenValid_ShouldThrowExceptionForInvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> jwtService.isTokenValid(invalidToken, TEST_EMAIL));
        
        assertEquals("Invalid or expired token", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 