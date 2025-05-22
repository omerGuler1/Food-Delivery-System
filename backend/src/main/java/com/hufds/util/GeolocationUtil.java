package com.hufds.util;

import java.math.BigDecimal;

/**
 * Utility class for geolocation operations
 */
public class GeolocationUtil {

    private static final int EARTH_RADIUS_KM = 6371; // Earth radius in kilometers

    /**
     * Calculate distance between two points using the Haversine formula
     * 
     * @param lat1 latitude of first point
     * @param lon1 longitude of first point
     * @param lat2 latitude of second point
     * @param lon2 longitude of second point
     * @return distance in kilometers
     */
    public static double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        // If any coordinate is null, return -1 to indicate invalid coordinates
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return -1;
        }

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) * 
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Calculate distance between two points using the Haversine formula
     * 
     * @param lat1 latitude of first point
     * @param lon1 longitude of first point
     * @param lat2 latitude of second point
     * @param lon2 longitude of second point
     * @return distance in kilometers
     */
    public static double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        // If any coordinate is null, return -1 to indicate invalid coordinates
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return -1;
        }

        return calculateDistance(
            BigDecimal.valueOf(lat1),
            BigDecimal.valueOf(lon1),
            BigDecimal.valueOf(lat2),
            BigDecimal.valueOf(lon2)
        );
    }
} 