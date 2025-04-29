package com.hufds.controller;

import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.service.CourierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier")
public class CourierController {

    @Autowired
    private CourierService courierService;

    @GetMapping("/profile/{courierId}")
    public ResponseEntity<Courier> getCourierProfile(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getCourierProfile(courierId));
    }

    @PutMapping("/profile/{courierId}")
    public ResponseEntity<Courier> updateCourierProfile(
            @PathVariable Integer courierId,
            @RequestBody Courier courier) {
        return ResponseEntity.ok(courierService.updateCourierProfile(courierId, courier));
    }

    @PutMapping("/status/{courierId}")
    public ResponseEntity<Void> updateCourierStatus(
            @PathVariable Integer courierId,
            @RequestParam Courier.CourierStatus status) {
        courierService.updateCourierStatus(courierId, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        return ResponseEntity.ok(courierService.getAvailableOrders());
    }

    @GetMapping("/orders/active/{courierId}")
    public ResponseEntity<List<Order>> getActiveDeliveries(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getActiveDeliveries(courierId));
    }

    @GetMapping("/orders/past/{courierId}")
    public ResponseEntity<List<Order>> getPastDeliveries(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getPastDeliveries(courierId));
    }

    @PostMapping("/orders/{orderId}/accept/{courierId}")
    public ResponseEntity<Order> acceptOrder(
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.acceptOrder(courierId, orderId));
    }

    @PostMapping("/orders/{orderId}/complete/{courierId}")
    public ResponseEntity<Order> completeDelivery(
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.completeDelivery(courierId, orderId));
    }

    @PostMapping("/orders/{orderId}/cancel/{courierId}")
    public ResponseEntity<Order> cancelDelivery(
            @PathVariable Integer orderId,
            @PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.cancelDelivery(courierId, orderId));
    }

    @GetMapping("/earnings/{courierId}")
    public ResponseEntity<Double> getTotalEarnings(@PathVariable Integer courierId) {
        return ResponseEntity.ok(courierService.getTotalEarnings(courierId));
    }
} 