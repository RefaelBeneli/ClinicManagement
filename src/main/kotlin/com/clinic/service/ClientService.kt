package com.clinic.service

import com.clinic.dto.ClientRequest
import com.clinic.dto.ClientResponse
import com.clinic.dto.UpdateClientRequest
import com.clinic.entity.Client
import com.clinic.entity.User
import com.clinic.repository.ClientRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ClientService {

    @Autowired
    private lateinit var clientRepository: ClientRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createClient(clientRequest: ClientRequest): ClientResponse {
        val currentUser = authService.getCurrentUser()
        val client = Client(
            fullName = clientRequest.fullName,
            email = clientRequest.email,
            phone = clientRequest.phone,
            notes = clientRequest.notes,
            user = currentUser
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

        val updatedClient = client.copy(
            fullName = updateRequest.fullName ?: client.fullName,
            email = updateRequest.email ?: client.email,
            phone = updateRequest.phone ?: client.phone,
            notes = updateRequest.notes ?: client.notes,
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
        println("🔍 Mapping client: ${client.id}, isActive: ${client.isActive}")
        return ClientResponse(
            id = client.id,
            fullName = client.fullName,
            email = client.email,
            phone = client.phone,
            notes = client.notes,
            createdAt = client.createdAt,
            isActive = client.isActive
        )
    }
} 