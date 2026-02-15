package com.lectio.api.security.jwt;

import com.lectio.api.model.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Generar token para un usuario
    public String generateToken(Usuario usuario) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        String roleName = (usuario.getRol() != null)
                ? usuario.getRol().getNombre()
                : "USER";

        return Jwts.builder()
                .setSubject(usuario.getNombre())              // username
                .setIssuedAt(now)
                .setExpiration(expiry)
                .claim("roles", List.of(roleName))            // roles como claim
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Obtener el username (subject) del token
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getBody().getSubject();
    }

    // Comprobar si el token es válido (firma correcta y no expirado)
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
    }
}
