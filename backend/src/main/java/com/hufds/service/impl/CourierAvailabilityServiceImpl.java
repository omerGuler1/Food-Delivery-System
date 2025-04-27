package com.hufds.service.impl;

import com.hufds.dto.CourierAvailabilityDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.CourierAssignment;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.CourierAssignmentRepository;
import com.hufds.service.CourierAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourierAvailabilityServiceImpl implements CourierAvailabilityService {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private CourierAssignmentRepository assignmentRepository;

    @Override
    @Transactional
    public Courier updateAvailability(Integer courierId, CourierAvailabilityDTO availabilityDTO) {
        // Validate courier exists
        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));

        // Check if courier has any active assignments
        if (availabilityDTO.getStatus() == Courier.CourierStatus.Unavailable) {
            List<CourierAssignment> activeAssignments = assignmentRepository.findByCourierCourierIdAndStatusIn(
                courierId, 
                List.of(CourierAssignment.AssignmentStatus.ASSIGNED, CourierAssignment.AssignmentStatus.PICKED_UP)
            );
            
            if (!activeAssignments.isEmpty()) {
                throw new CustomException("Cannot set courier as unavailable while they have active assignments", HttpStatus.BAD_REQUEST);
            }
        }

        // Update availability status
        courier.setStatus(availabilityDTO.getStatus());
        return courierRepository.save(courier);
    }

    @Override
    public List<Courier> getAvailableCouriers() {
        return courierRepository.findByStatus(Courier.CourierStatus.Available);
    }

    @Override
    public Courier getCourierById(Integer courierId) {
        return courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
    }
} 