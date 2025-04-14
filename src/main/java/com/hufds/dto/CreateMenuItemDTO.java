package com.hufds.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class CreateMenuItemDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Boolean availability;
}
