package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerListDTO {
    private Integer customerId;
    private String name;
    private String email;
    private String phoneNumber;
    private String createdAt;
} 