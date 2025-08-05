package com.clinic.controller

import com.clinic.dto.PaymentTypeRequest
import com.clinic.dto.PaymentTypeResponse
import com.clinic.dto.UpdatePaymentTypeRequest
import com.clinic.service.PaymentTypeService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/payment-types")
@PreAuthorize("hasRole('ADMIN')")
class PaymentTypeController(
    private val paymentTypeService: PaymentTypeService
) {
    
    @GetMapping
    fun getAllPaymentTypes(): ResponseEntity<List<PaymentTypeResponse>> {
        val paymentTypes = paymentTypeService.getAllPaymentTypes()
        return ResponseEntity.ok(paymentTypes)
    }
    
    @GetMapping("/active")
    fun getActivePaymentTypes(): ResponseEntity<List<PaymentTypeResponse>> {
        val paymentTypes = paymentTypeService.getActivePaymentTypes()
        return ResponseEntity.ok(paymentTypes)
    }
    
    @GetMapping("/{id}")
    fun getPaymentTypeById(@PathVariable id: Long): ResponseEntity<PaymentTypeResponse> {
        val paymentType = paymentTypeService.getPaymentTypeById(id)
        return ResponseEntity.ok(paymentType)
    }
    
    @PostMapping
    fun createPaymentType(@RequestBody request: PaymentTypeRequest): ResponseEntity<PaymentTypeResponse> {
        val paymentType = paymentTypeService.createPaymentType(request)
        return ResponseEntity.ok(paymentType)
    }
    
    @PutMapping("/{id}")
    fun updatePaymentType(
        @PathVariable id: Long,
        @RequestBody request: UpdatePaymentTypeRequest
    ): ResponseEntity<PaymentTypeResponse> {
        val paymentType = paymentTypeService.updatePaymentType(id, request)
        return ResponseEntity.ok(paymentType)
    }
    
    @DeleteMapping("/{id}")
    fun deletePaymentType(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        paymentTypeService.deletePaymentType(id)
        return ResponseEntity.ok(mapOf("message" to "Payment type deleted successfully"))
    }
    
    @PatchMapping("/{id}/toggle")
    fun togglePaymentTypeActive(@PathVariable id: Long): ResponseEntity<PaymentTypeResponse> {
        val paymentType = paymentTypeService.togglePaymentTypeActive(id)
        return ResponseEntity.ok(paymentType)
    }
} 