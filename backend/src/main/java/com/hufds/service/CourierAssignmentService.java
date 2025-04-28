package com.hufds.service;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.dto.CourierOrderHistoryDTO;
import com.hufds.entity.CourierAssignment;

import java.util.List;

public interface CourierAssignmentService {
    CourierAssignment assignOrderToCourier(CourierAssignmentDTO assignmentDTO);
    CourierAssignment updateAssignmentStatus(Integer assignmentId, CourierAssignment.AssignmentStatus status);
    CourierAssignment getAssignmentById(Integer assignmentId);
    List<CourierOrderHistoryDTO> getCourierOrderHistory(Integer courierId);
} 