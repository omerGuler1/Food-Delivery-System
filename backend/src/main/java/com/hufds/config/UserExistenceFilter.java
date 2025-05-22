package com.hufds.config;

import com.hufds.entity.AdminUser;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;
import com.hufds.entity.Courier;
import com.hufds.repository.AdminRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.repository.CourierRepository;
import com.hufds.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserExistenceFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractEmail(jwt);
            final String userType = jwtService.extractUserType(jwt);
            
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() != null) {
                boolean userExists = checkUserExists(userEmail, userType);
                
                if (!userExists) {
                    // Kullanıcı silinmiş, oturumu sonlandır
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("User account has been deleted");
                    return;
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
        }
    }
    
    private boolean checkUserExists(String email, String userType) {
        if (userType == null) {
            return false;
        }
        
        switch (userType.toLowerCase()) {
            case "customer":
                Optional<Customer> customer = customerRepository.findByEmail(email);
                return customer.isPresent() && customer.get().getDeletedAt() == null;
                
            case "restaurant":
                Optional<Restaurant> restaurant = restaurantRepository.findByEmail(email);
                return restaurant.isPresent() && restaurant.get().getDeletedAt() == null;
                
            case "courier":
                Optional<Courier> courier = courierRepository.findByEmail(email);
                return courier.isPresent() && courier.get().getDeletedAt() == null;
                
            case "admin":
                Optional<AdminUser> admin = adminRepository.findByEmail(email);
                return admin.isPresent() && admin.get().getDeletedAt() == null;
                
            default:
                return false;
        }
    }
} 