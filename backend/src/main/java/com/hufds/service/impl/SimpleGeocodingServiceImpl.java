package com.hufds.service.impl;

import com.hufds.service.GeocodingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple implementation of GeocodingService that uses central city coordinates
 * for geocoding addresses. This way all addresses in the same city will have
 * the same coordinates, making delivery range calculations more predictable.
 */
@Service
public class SimpleGeocodingServiceImpl implements GeocodingService {
    
    private static final Logger log = LoggerFactory.getLogger(SimpleGeocodingServiceImpl.class);

    // Cache of geocoded addresses to ensure same addresses get same coordinates
    private final Map<String, Coordinates> geocodeCache = new HashMap<>();
    
    // Major city coordinates as reference points, keyed by city name in lowercase
    private final Map<String, Coordinates> majorCities = new HashMap<>();
    
    public SimpleGeocodingServiceImpl() {
        // Initialize with Turkish cities
        // Major cities
        majorCities.put("istanbul", new Coordinates(
                new BigDecimal("41.0082"), new BigDecimal("28.9784")));
        majorCities.put("ankara", new Coordinates(
                new BigDecimal("39.9334"), new BigDecimal("32.8597")));
        majorCities.put("izmir", new Coordinates(
                new BigDecimal("38.4237"), new BigDecimal("27.1428")));
        majorCities.put("antalya", new Coordinates(
                new BigDecimal("36.8969"), new BigDecimal("30.7133")));
        majorCities.put("bursa", new Coordinates(
                new BigDecimal("40.1885"), new BigDecimal("29.0610")));
                
        // Additional Turkish cities
        majorCities.put("adana", new Coordinates(
                new BigDecimal("37.0000"), new BigDecimal("35.3213")));
        majorCities.put("gaziantep", new Coordinates(
                new BigDecimal("37.0662"), new BigDecimal("37.3833")));
        majorCities.put("konya", new Coordinates(
                new BigDecimal("37.8667"), new BigDecimal("32.4833")));
        majorCities.put("mersin", new Coordinates(
                new BigDecimal("36.8000"), new BigDecimal("34.6333")));
        majorCities.put("kayseri", new Coordinates(
                new BigDecimal("38.7167"), new BigDecimal("35.4833")));
        majorCities.put("eskişehir", new Coordinates(
                new BigDecimal("39.7767"), new BigDecimal("30.5206")));
        majorCities.put("diyarbakır", new Coordinates(
                new BigDecimal("37.9144"), new BigDecimal("40.2306")));
        majorCities.put("şanlıurfa", new Coordinates(
                new BigDecimal("37.1591"), new BigDecimal("38.7969")));
        majorCities.put("sanliurfa", new Coordinates(
                new BigDecimal("37.1591"), new BigDecimal("38.7969")));
        majorCities.put("samsun", new Coordinates(
                new BigDecimal("41.2867"), new BigDecimal("36.3300")));
        majorCities.put("trabzon", new Coordinates(
                new BigDecimal("41.0050"), new BigDecimal("39.7225")));
        majorCities.put("malatya", new Coordinates(
                new BigDecimal("38.3552"), new BigDecimal("38.3095")));
        
        // More cities
        majorCities.put("denizli", new Coordinates(
                new BigDecimal("37.7765"), new BigDecimal("29.0864")));
        majorCities.put("hatay", new Coordinates(
                new BigDecimal("36.2025"), new BigDecimal("36.1606")));
        majorCities.put("manisa", new Coordinates(
                new BigDecimal("38.6191"), new BigDecimal("27.4289")));
        majorCities.put("kahramanmaras", new Coordinates(
                new BigDecimal("37.5753"), new BigDecimal("36.9228")));
        majorCities.put("kahramanmaraş", new Coordinates(
                new BigDecimal("37.5753"), new BigDecimal("36.9228")));
        majorCities.put("van", new Coordinates(
                new BigDecimal("38.4891"), new BigDecimal("43.4089")));
        majorCities.put("adapazari", new Coordinates(
                new BigDecimal("40.7801"), new BigDecimal("30.4034")));
        majorCities.put("adapazarı", new Coordinates(
                new BigDecimal("40.7801"), new BigDecimal("30.4034")));
        majorCities.put("aydin", new Coordinates(
                new BigDecimal("37.8560"), new BigDecimal("27.8416")));
        majorCities.put("aydın", new Coordinates(
                new BigDecimal("37.8560"), new BigDecimal("27.8416")));
        majorCities.put("balikesir", new Coordinates(
                new BigDecimal("39.6484"), new BigDecimal("27.8826")));
        majorCities.put("balıkesir", new Coordinates(
                new BigDecimal("39.6484"), new BigDecimal("27.8826")));
        majorCities.put("batman", new Coordinates(
                new BigDecimal("37.8812"), new BigDecimal("41.1351")));
        majorCities.put("elazig", new Coordinates(
                new BigDecimal("38.6810"), new BigDecimal("39.2264")));
        majorCities.put("elazığ", new Coordinates(
                new BigDecimal("38.6810"), new BigDecimal("39.2264")));
        majorCities.put("erzurum", new Coordinates(
                new BigDecimal("39.9087"), new BigDecimal("41.2766")));
        majorCities.put("gebze", new Coordinates(
                new BigDecimal("40.8093"), new BigDecimal("29.4398")));
        majorCities.put("isparta", new Coordinates(
                new BigDecimal("37.7648"), new BigDecimal("30.5566")));
        majorCities.put("kocaeli", new Coordinates(
                new BigDecimal("40.8533"), new BigDecimal("29.8815")));
        majorCities.put("izmit", new Coordinates(
                new BigDecimal("40.7654"), new BigDecimal("29.9408")));
        majorCities.put("ordu", new Coordinates(
                new BigDecimal("40.9862"), new BigDecimal("37.8797")));
        majorCities.put("osmaniye", new Coordinates(
                new BigDecimal("37.0746"), new BigDecimal("36.2464")));
        majorCities.put("rize", new Coordinates(
                new BigDecimal("41.0254"), new BigDecimal("40.5177")));
        majorCities.put("siirt", new Coordinates(
                new BigDecimal("37.9333"), new BigDecimal("41.9500")));
        majorCities.put("tekirdag", new Coordinates(
                new BigDecimal("40.9781"), new BigDecimal("27.5126")));
        majorCities.put("tekirdağ", new Coordinates(
                new BigDecimal("40.9781"), new BigDecimal("27.5126")));
        majorCities.put("tokat", new Coordinates(
                new BigDecimal("40.3167"), new BigDecimal("36.5500")));
        majorCities.put("usak", new Coordinates(
                new BigDecimal("38.6742"), new BigDecimal("29.4058")));
        majorCities.put("uşak", new Coordinates(
                new BigDecimal("38.6742"), new BigDecimal("29.4058")));
        majorCities.put("yalova", new Coordinates(
                new BigDecimal("40.6500"), new BigDecimal("29.2667")));
        majorCities.put("zonguldak", new Coordinates(
                new BigDecimal("41.4564"), new BigDecimal("31.7897")));
    }

    @Override
    public Coordinates geocodeAddress(String street, String city, String state, String zipCode, String country) {
        // Log the incoming geocoding request
        log.info("Geocoding address: street={}, city={}, state={}, zipCode={}, country={}", 
                street, city, state, zipCode, country);
        
        // Create a key for the address to check/store in cache
        String addressKey = (street + city + state + zipCode + country).toLowerCase();
        
        // Check if we have this address cached
        if (geocodeCache.containsKey(addressKey)) {
            Coordinates cachedCoords = geocodeCache.get(addressKey);
            log.info("Using cached coordinates: lat={}, lon={}", 
                    cachedCoords.getLatitude(), cachedCoords.getLongitude());
            return cachedCoords;
        }
        
        // Try to find coordinates based on city name - this is now the primary method
        if (city != null && !city.trim().isEmpty()) {
            // Clean and normalize the city name
            String lowerCaseCity = city.toLowerCase().trim();
            
            // Search for exact city name match
            if (majorCities.containsKey(lowerCaseCity)) {
                Coordinates cityCoordinates = majorCities.get(lowerCaseCity);
                geocodeCache.put(addressKey, cityCoordinates);
                log.info("Found exact city match: {} -> coordinates: ({}, {})", 
                        city, cityCoordinates.getLatitude(), cityCoordinates.getLongitude());
                return cityCoordinates;
            }
            
            // Replace Turkish characters with ASCII equivalents for more robust matching
            String normalizedCity = lowerCaseCity
                    .replace('ı', 'i')
                    .replace('ğ', 'g')
                    .replace('ü', 'u')
                    .replace('ş', 's')
                    .replace('ö', 'o')
                    .replace('ç', 'c');
            
            // Try match with normalized city name
            for (Map.Entry<String, Coordinates> entry : majorCities.entrySet()) {
                String normKey = entry.getKey()
                        .replace('ı', 'i')
                        .replace('ğ', 'g')
                        .replace('ü', 'u')
                        .replace('ş', 's')
                        .replace('ö', 'o')
                        .replace('ç', 'c');
                
                if (normKey.equals(normalizedCity)) {
                    Coordinates cityCoordinates = entry.getValue();
                    geocodeCache.put(addressKey, cityCoordinates);
                    log.info("Found normalized city match: {} -> {} -> coordinates: ({}, {})", 
                            city, entry.getKey(), cityCoordinates.getLatitude(), cityCoordinates.getLongitude());
                    return cityCoordinates;
                }
            }
            
            // Try partial match if normalized match fails
            for (Map.Entry<String, Coordinates> entry : majorCities.entrySet()) {
                if (entry.getKey().contains(lowerCaseCity) || lowerCaseCity.contains(entry.getKey())) {
                    Coordinates cityCoordinates = entry.getValue();
                    geocodeCache.put(addressKey, cityCoordinates);
                    log.info("Found partial city match: {} -> {} -> coordinates: ({}, {})", 
                            city, entry.getKey(), cityCoordinates.getLatitude(), cityCoordinates.getLongitude());
                    return cityCoordinates;
                }
            }
            
            // Try matching first 3-4 chars (for shortened city names)
            if (lowerCaseCity.length() >= 3) {
                String cityPrefix = lowerCaseCity.substring(0, Math.min(4, lowerCaseCity.length()));
                for (Map.Entry<String, Coordinates> entry : majorCities.entrySet()) {
                    if (entry.getKey().startsWith(cityPrefix)) {
                        Coordinates cityCoordinates = entry.getValue();
                        geocodeCache.put(addressKey, cityCoordinates);
                        log.info("Found prefix city match: {} -> {} -> coordinates: ({}, {})", 
                                city, entry.getKey(), cityCoordinates.getLatitude(), cityCoordinates.getLongitude());
                        return cityCoordinates;
                    }
                }
            }
            
            log.info("No city match found for: {}", city);
        } else {
            log.info("No city provided for geocoding");
        }
        
        // Try to extract the city from the street or zipCode if the city is not provided
        String potentialCity = extractCityFromStreet(street);
        if (potentialCity != null && majorCities.containsKey(potentialCity)) {
            Coordinates cityCoordinates = majorCities.get(potentialCity);
            geocodeCache.put(addressKey, cityCoordinates);
            log.info("Extracted city from street: {} -> coordinates: ({}, {})", 
                    potentialCity, cityCoordinates.getLatitude(), cityCoordinates.getLongitude());
            return cityCoordinates;
        }
        
        // If we don't know the city, generate approximate coordinates
        // This will be consistent for the same input but not geographically accurate
        Coordinates approximateCoords = generateApproximateCoordinates(addressKey);
        geocodeCache.put(addressKey, approximateCoords);
        log.info("Generated approximate coordinates: lat={}, lon={}", 
                approximateCoords.getLatitude(), approximateCoords.getLongitude());
        return approximateCoords;
    }
    
    private Coordinates generateApproximateCoordinates(String addressKey) {
        // Fix: Guard against null or empty addressKey
        if (addressKey == null || addressKey.isEmpty()) {
            // Return default coordinates in Turkey if no address information is provided
            log.warn("Empty address key provided, returning default coordinates");
            return new Coordinates(
                new BigDecimal("39.9334").setScale(6, RoundingMode.HALF_UP),  // Ankara latitude
                new BigDecimal("32.8597").setScale(6, RoundingMode.HALF_UP)   // Ankara longitude
            );
        }
        
        // Generate a hash code from the address
        int hashCode = addressKey.hashCode();
        
        // Ensure we use a positive hashCode by taking the absolute value
        int absHashCode = Math.abs(hashCode);
        
        // Generate latitude between 36° and 42° (approximate range for Turkey)
        double latBase = 36.0 + (absHashCode % 600) / 100.0;
        // Generate longitude between 26° and 45° (approximate range for Turkey)
        double lonBase = 26.0 + (absHashCode / 1000 % 1900) / 100.0;
        
        log.debug("Generated coordinates from hash: addressKey={}, hashCode={}, lat={}, lon={}",
                addressKey, hashCode, latBase, lonBase);
        
        return new Coordinates(
                new BigDecimal(latBase).setScale(6, RoundingMode.HALF_UP),
                new BigDecimal(lonBase).setScale(6, RoundingMode.HALF_UP)
        );
    }

    /**
     * Try to extract a city name from the street address
     * @param street The street address string
     * @return A city name if found, null otherwise
     */
    private String extractCityFromStreet(String street) {
        if (street == null || street.isEmpty()) {
            return null;
        }
        
        String lowerStreet = street.toLowerCase();
        
        // Try to find any city name in the street string
        for (String cityName : majorCities.keySet()) {
            if (lowerStreet.contains(cityName)) {
                return cityName;
            }
        }
        
        return null;
    }
} 