package com.hufds.controller;

import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.Order;
import com.hufds.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // CREATE
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody PlaceOrderRequestDTO dto) {
        Order createdOrder = orderService.placeOrder(dto);
        return ResponseEntity.ok(createdOrder);
    }

    // READ
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE STATUS (Admin only or internal use)
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Integer id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // CANCEL ORDER (Customer triggered)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}
