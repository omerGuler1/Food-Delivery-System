package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "Address")
@JsonIgnoreProperties({"customer.orders", "customer.payments", "customer.reviews", "customer.favoriteRestaurants", "orders.customer", "orders.courier", "orders.restaurant"})
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Integer addressId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference(value = "customer-addresses")
    private Customer customer;

    @OneToMany(mappedBy = "address")
    @JsonManagedReference(value = "order-address")
    private Set<Order> orders = new HashSet<>();

    @Column(length = 255, nullable = false)
    private String street;

    @Column(length = 100, nullable = false)
    private String city;

    @Column(length = 100, nullable = false)
    private String state;

    @Column(name = "zip_code", length = 100, nullable = false)
    private String zipCode;

    @Column(length = 100, nullable = false)
    private String country;

    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    public String getFullAddress() {
        return String.format("%s, %s, %s %s, %s", street, city, state, zipCode, country);
    }
}
