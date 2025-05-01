package com.hufds.dto;

import com.hufds.entity.Courier.CourierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourierResponseDTO {
    private String token;
    private Integer courierId;
    private String name;
    private String email;
    private String phoneNumber;
    private String vehicleType;
    private CourierStatus status;
    private BigDecimal earnings;
}