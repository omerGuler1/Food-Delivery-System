package com.hufds.dto;

import lombok.Data;

@Data
public class OrderItemRequestDTO {
    private Integer menuItemId;
    private Integer quantity;
}
