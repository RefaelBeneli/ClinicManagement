package com.clinic.service

import com.clinic.dto.ClientRequest
import com.clinic.dto.ClientResponse
import com.clinic.dto.UpdateClientRequest
import com.clinic.entity.Client
import com.clinic.entity.ClientSource
import com.clinic.entity.User
import com.clinic.repository.ClientRepository
import com.clinic.repository.ClientSourceRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ClientService {

    @Autowired
    private lateinit var clientRepository: ClientRepository

    @Autowired
    private lateinit var clientSourceRepository: ClientSourceRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createClient(clientRequest: ClientRequest): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val source = clientSourceRepository.findById(clientRequest.sourceId)
            .orElseThrow { RuntimeException("Client source not found") }
        
        val client = Client(
            fullName = clientRequest.fullName,
            email = clientRequest.email,
            phone = clientRequest.phone,
            notes = clientRequest.notes,
            user = currentUser,
            source = source
        )
        val savedClient = clientRepository.save(client)
        return mapToResponse(savedClient)
    }

    fun getAllClients(): List<ClientResponse> {
        val currentUser = authService.getCurrentUser()
        return clientRepository.findByUser(currentUser)
            .map { mapToResponse(it) }
    }

    fun getClientById(id: Long): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(id, currentUser)
            ?: throw RuntimeException("Client not found")
        return mapToResponse(client)
    }

    fun updateClient(id: Long, updateRequest: UpdateClientRequest): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(id, currentUser)
            ?: throw RuntimeException("Client not found")

        val source = updateRequest.sourceId?.let { sourceId ->
            clientSourceRepository.findById(sourceId)
                .orElseThrow { RuntimeException("Client source not found") }
        } ?: client.source

        val updatedClient = client.copy(
            fullName = updateRequest.fullName ?: client.fullName,
            email = updateRequest.email ?: client.email,
            phone = updateRequest.phone ?: client.phone,
            notes = updateRequest.notes ?: client.notes,
            source = source,
            isActive = updateRequest.isActive ?: client.isActive
        )

        val savedClient = clientRepository.save(updatedClient)
        return mapToResponse(savedClient)
    }

    fun deleteClient(id: Long) {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(id, currentUser)
            ?: throw RuntimeException("Client not found")

        val deactivatedClient = client.copy(isActive = false)
        clientRepository.save(deactivatedClient)
    }

    fun searchClients(name: String): List<ClientResponse> {
        val currentUser = authService.getCurrentUser()
        return clientRepository.findByUserAndFullNameContainingIgnoreCaseAndIsActiveTrue(currentUser, name)
            .map { mapToResponse(it) }
    }

    fun activateClient(id: Long): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(id, currentUser)
            ?: throw RuntimeException("Client not found")

        val activatedClient = client.copy(isActive = true)
        val savedClient = clientRepository.save(activatedClient)
        return mapToResponse(savedClient)
    }

    fun deactivateClient(id: Long): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(id, currentUser)
            ?: throw RuntimeException("Client not found")

        val deactivatedClient = client.copy(isActive = false)
        val savedClient = clientRepository.save(deactivatedClient)
        return mapToResponse(savedClient)
    }

    private fun mapToResponse(client: Client): ClientResponse {
        return ClientResponse(
            id = client.id,
            fullName = client.fullName,
            email = client.email,
            phone = client.phone,
            notes = client.notes,
            source = mapToSourceResponse(client.source),
            createdAt = client.createdAt,
            isActive = client.isActive
        )
    }

    private fun mapToSourceResponse(source: ClientSource): com.clinic.dto.ClientSourceResponse {
        return com.clinic.dto.ClientSourceResponse(
            id = source.id,
            name = source.name,
            duration = source.duration,
            price = source.price,
            noShowPrice = source.noShowPrice,
            isActive = source.isActive,
            createdAt = source.createdAt,
            updatedAt = source.updatedAt
        )
    }
} 