package com.lectio.api.security.jwt;

import com.lectio.api.model.Usuario;
import com.lectio.api.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtProvider jwtProvider,
                                   UsuarioRepository usuarioRepository) {
        this.jwtProvider = jwtProvider;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        return path.startsWith("/api/auth") ||
                (path.startsWith("/api/libros") && "GET".equalsIgnoreCase(method)) || // ← SOLO GET
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars") ||
                path.equals("/error") ||
                path.equals("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        System.out.println("🔐 ===== FILTRO JWT =====");
        System.out.println("🔐 Path: " + path);
        System.out.println("🔐 Method: " + method);

        // Verificar si debe filtrar o no
        if (shouldNotFilter(request)) {
            System.out.println("🔴 EXCLUYENDO (shouldNotFilter=true): " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("🔐 Auth Header: " + (authHeader != null ? "PRESENTE" : "NO HAY"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("🔐 Token: " + token.substring(0, Math.min(20, token.length())) + "...");

            if (jwtProvider.isTokenValid(token)) {
                String username = jwtProvider.getUsernameFromToken(token);
                System.out.println("🔐 Usuario autenticado: " + username);

                Usuario usuario = usuarioRepository.findByNombre(username).orElse(null);
                if (usuario != null && !usuario.isBanned()) {
                    String roleName = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "USER";
                    System.out.println("🔐 Rol del usuario: " + roleName);

                    // ✅ CREAR LA AUTENTICACIÓN
                    var authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + roleName)
                    );

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    authorities
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // ✅ ESTABLECER LA AUTENTICACIÓN EN EL CONTEXTO
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("✅ Autenticación establecida para: " + username);
                }
            } else {
                System.out.println("🔐 Token INVÁLIDO");
            }
        } else {
            System.out.println("🔐 No hay token - continuando como anónimo");
        }

        filterChain.doFilter(request, response);
    }
}