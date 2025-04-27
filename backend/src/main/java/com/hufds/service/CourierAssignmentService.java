package com.hufds.service;

import com.hufds.dto.CourierAssignmentDTO;
import com.hufds.entity.CourierAssignment;

public interface CourierAssignmentService {
    CourierAssignment assignOrderToCourier(CourierAssignmentDTO assignmentDTO);
    CourierAssignment updateAssignmentStatus(Integer assignmentId, CourierAssignment.AssignmentStatus status);
    CourierAssignment getAssignmentById(Integer assignmentId);
} 