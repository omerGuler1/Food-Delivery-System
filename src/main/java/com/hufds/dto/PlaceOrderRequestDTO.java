package com.hufds.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlaceOrderRequestDTO {
    private Integer customerId;
    private Integer restaurantId;
    private Integer addressId;
    private List<OrderItemRequestDTO> items;
}
