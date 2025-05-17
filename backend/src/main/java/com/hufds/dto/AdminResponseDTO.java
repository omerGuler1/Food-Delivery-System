package com.hufds.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminResponseDTO {
    private String token;
    private Integer adminId;
    private String name;
    private String email;
    private String phoneNumber;
}
