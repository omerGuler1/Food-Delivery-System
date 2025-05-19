package com.hufds.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourierAssignmentRequestDTO {
    private Integer orderId;
    private Integer courierId;
} 