package com.clinic.controller

import com.clinic.dto.PaymentTypeResponse
import com.clinic.service.PaymentTypeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/payment-types")
class PublicPaymentTypeController(
    private val paymentTypeService: PaymentTypeService
) {
    
    // Public endpoint for regular users to get active payment types
    @GetMapping("/active")
    fun getActivePaymentTypes(): ResponseEntity<List<PaymentTypeResponse>> {
        val paymentTypes = paymentTypeService.getActivePaymentTypes()
        return ResponseEntity.ok(paymentTypes)
    }
}
