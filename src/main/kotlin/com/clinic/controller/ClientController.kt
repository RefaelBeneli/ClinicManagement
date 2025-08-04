package com.clinic.controller

import com.clinic.dto.ClientRequest
import com.clinic.dto.ClientResponse
import com.clinic.dto.MessageResponse
import com.clinic.dto.UpdateClientRequest
import com.clinic.service.ClientService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/clients")
class ClientController {

    private val logger = LoggerFactory.getLogger(ClientController::class.java)

    @Autowired
    private lateinit var clientService: ClientService

    @GetMapping
    fun getAllClients(): ResponseEntity<List<ClientResponse>> {
        return try {
            val clients = clientService.getAllClients()
            ResponseEntity.ok(clients)
        } catch (e: Exception) {
            logger.error("Failed to get all clients", e)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    fun getClientById(@PathVariable id: Long): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.getClientById(id)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            logger.error("Failed to get client by id: $id", e)
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    fun createClient(@Valid @RequestBody clientRequest: ClientRequest): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.createClient(clientRequest)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            logger.error("Failed to create client: ${clientRequest.fullName}", e)
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun updateClient(
        @PathVariable id: Long,
        @Valid @RequestBody updateRequest: UpdateClientRequest
    ): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.updateClient(id, updateRequest)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            logger.error("Failed to update client: $id", e)
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteClient(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return try {
            clientService.deleteClient(id)
            ResponseEntity.ok(MessageResponse("Client deactivated successfully"))
        } catch (e: Exception) {
            logger.error("Failed to delete client: $id", e)
            ResponseEntity.badRequest().body(MessageResponse("Failed to deactivate client"))
        }
    }

    @PatchMapping("/{id}/disable")
    fun disableClient(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return try {
            clientService.deleteClient(id) // This already does soft delete
            ResponseEntity.ok(MessageResponse("Client disabled successfully"))
        } catch (e: Exception) {
            logger.error("Failed to disable client: $id", e)
            ResponseEntity.badRequest().body(MessageResponse("Failed to disable client"))
        }
    }

    @GetMapping("/search")
    fun searchClients(@RequestParam name: String): ResponseEntity<List<ClientResponse>> {
        return try {
            val clients = clientService.searchClients(name)
            ResponseEntity.ok(clients)
        } catch (e: Exception) {
            logger.error("Failed to search clients with name: $name", e)
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/activate")
    fun activateClient(@PathVariable id: Long): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.activateClient(id)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            logger.error("Failed to activate client: $id", e)
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/deactivate")
    fun deactivateClient(@PathVariable id: Long): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.deactivateClient(id)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            logger.error("Failed to deactivate client: $id", e)
            ResponseEntity.badRequest().build()
        }
    }
} 