package com.hufds.service;

import java.math.BigDecimal;

/**
 * Service for geocoding addresses to coordinates
 */
public interface GeocodingService {

    /**
     * Class to hold latitude and longitude coordinates
     */
    class Coordinates {
        private final BigDecimal latitude;
        private final BigDecimal longitude;

        public Coordinates(BigDecimal latitude, BigDecimal longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public BigDecimal getLatitude() {
            return latitude;
        }

        public BigDecimal getLongitude() {
            return longitude;
        }
    }

    /**
     * Geocode an address to coordinates
     *
     * @param street Street address
     * @param city City
     * @param state State/province
     * @param zipCode Postal/ZIP code
     * @param country Country
     * @return Coordinates (latitude/longitude)
     */
    Coordinates geocodeAddress(String street, String city, String state, String zipCode, String country);
} 