package com.hufds.service;

import com.hufds.dto.MenuItemSearchDTO;
import com.hufds.dto.MenuItemSearchResultDTO;
import java.util.List;

public interface MenuItemSearchService {
    List<MenuItemSearchResultDTO> searchMenuItems(MenuItemSearchDTO searchDTO);
} 