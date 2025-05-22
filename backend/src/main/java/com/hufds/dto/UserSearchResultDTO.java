package com.hufds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for user search results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResultDTO {
    private Integer id;
    private String name;
    private String email;
    private String type;
    private String phoneNumber;
} 