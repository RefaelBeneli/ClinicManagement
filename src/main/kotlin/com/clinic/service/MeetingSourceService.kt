package com.clinic.service

import com.clinic.dto.ClientSourceRequest
import com.clinic.dto.ClientSourceResponse
import com.clinic.dto.UpdateClientSourceRequest
import com.clinic.entity.ClientSource
import com.clinic.repository.ClientSourceRepository
import org.springframework.stereotype.Service

@Service
class ClientSourceService(
    private val clientSourceRepository: ClientSourceRepository
) {

    fun getAllSources(): List<ClientSourceResponse> {
        return clientSourceRepository.findAll()
            .map { it.toResponse() }
    }

    fun getActiveSources(): List<ClientSourceResponse> {
        return clientSourceRepository.findByIsActiveTrue()
            .map { it.toResponse() }
    }

    fun getSourceById(id: Long): ClientSourceResponse {
        val source = clientSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Client source not found") }
        return source.toResponse()
    }

    fun createSource(request: ClientSourceRequest): ClientSourceResponse {
        if (clientSourceRepository.findByName(request.name) != null) {
            throw RuntimeException("Source with this name already exists")
        }

        val source = ClientSource(
            name = request.name,
            duration = request.duration,
            price = request.price,
            noShowPrice = request.noShowPrice,
            defaultSessions = request.defaultSessions
        )
        return clientSourceRepository.save(source).toResponse()
    }

    fun updateSource(id: Long, request: UpdateClientSourceRequest): ClientSourceResponse {
        val source = clientSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Client source not found") }

        if (request.name != null && request.name != source.name) {
            if (clientSourceRepository.findByName(request.name) != null) {
                throw RuntimeException("Source with this name already exists")
            }
        }

        val updated = source.copy(
            name = request.name ?: source.name,
            duration = request.duration ?: source.duration,
            price = request.price ?: source.price,
            noShowPrice = request.noShowPrice ?: source.noShowPrice,
            defaultSessions = request.defaultSessions ?: source.defaultSessions,
            isActive = request.isActive ?: source.isActive
        )
        return clientSourceRepository.save(updated).toResponse()
    }

    fun deleteSource(id: Long) {
        val source = clientSourceRepository.findById(id)
            ?: throw RuntimeException("Client source not found")
        clientSourceRepository.deleteById(id)
    }

    fun toggleSourceActive(id: Long): ClientSourceResponse {
        val source = clientSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Client source not found") }
        val updated = source.copy(isActive = !source.isActive)
        return clientSourceRepository.save(updated).toResponse()
    }

    private fun ClientSource.toResponse(): ClientSourceResponse {
        return ClientSourceResponse(
            id = id,
            name = name,
            duration = duration,
            price = price,
            noShowPrice = noShowPrice,
            defaultSessions = defaultSessions,
            isActive = isActive,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
} 