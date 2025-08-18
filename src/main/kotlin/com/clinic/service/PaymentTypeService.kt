package com.clinic.service

import com.clinic.dto.PaymentTypeRequest
import com.clinic.dto.PaymentTypeResponse
import com.clinic.dto.UpdatePaymentTypeRequest
import com.clinic.entity.PaymentType
import com.clinic.repository.PaymentRepository
import com.clinic.repository.PaymentTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class PaymentTypeService(
    private val paymentTypeRepository: PaymentTypeRepository,
    private val paymentRepository: PaymentRepository
) {
    fun getAllPaymentTypes(): List<PaymentTypeResponse> {
        return paymentTypeRepository.findAll()
            .map { it.toResponse() }
    }
    
    fun getActivePaymentTypes(): List<PaymentTypeResponse> {
        return paymentTypeRepository.findByIsActiveTrue()
            .map { it.toResponse() }
    }
    
    fun getPaymentTypeById(id: Long): PaymentTypeResponse {
        val paymentType = paymentTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Payment type not found with id: $id") }
        return paymentType.toResponse()
    }
    
    fun createPaymentType(request: PaymentTypeRequest): PaymentTypeResponse {
        // Check if name already exists
        if (paymentTypeRepository.existsByName(request.name)) {
            throw RuntimeException("Payment type with name '${request.name}' already exists")
        }
        
        val paymentType = PaymentType(
            name = request.name
        )
        return paymentTypeRepository.save(paymentType).toResponse()
    }
    
    fun updatePaymentType(id: Long, request: UpdatePaymentTypeRequest): PaymentTypeResponse {
        val paymentType = paymentTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Payment type not found with id: $id") }
        
        // Check if new name conflicts with existing payment types
        if (request.name != null && request.name != paymentType.name) {
            if (paymentTypeRepository.existsByName(request.name)) {
                throw RuntimeException("Payment type with name '${request.name}' already exists")
            }
        }
        
        val updated = paymentType.copy(
            name = request.name ?: paymentType.name,
            isActive = request.isActive ?: paymentType.isActive,
            updatedAt = LocalDateTime.now()
        )
        return paymentTypeRepository.save(updated).toResponse()
    }
    
    fun deletePaymentType(id: Long) {
        val paymentType = paymentTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Payment type not found with id: $id") }
        
        // Check if payment type is used in payments
        if (paymentRepository.findByPaymentTypeId(id).isNotEmpty()) {
            throw RuntimeException("Cannot delete payment type that is used in payments")
        }
        
        paymentTypeRepository.deleteById(id)
    }
    
    fun togglePaymentTypeActive(id: Long): PaymentTypeResponse {
        val paymentType = paymentTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Payment type not found with id: $id") }
        
        val updated = paymentType.copy(
            isActive = !paymentType.isActive,
            updatedAt = LocalDateTime.now()
        )
        return paymentTypeRepository.save(updated).toResponse()
    }
    
    private fun PaymentType.toResponse(): PaymentTypeResponse {
        return PaymentTypeResponse(
            id = this.id,
            name = this.name,
            isActive = this.isActive,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
} 