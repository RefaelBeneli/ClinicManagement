package com.clinic.controller

import com.clinic.dto.ClientRequest
import com.clinic.dto.ClientResponse
import com.clinic.dto.MessageResponse
import com.clinic.dto.UpdateClientRequest
import com.clinic.service.ClientService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@CrossOrigin(origins = ["http://localhost:3000"], maxAge = 3600)
@RestController
@RequestMapping("/api/clients")
class ClientController {

    @Autowired
    private lateinit var clientService: ClientService

    @GetMapping
    fun getAllClients(): ResponseEntity<List<ClientResponse>> {
        return try {
            val clients = clientService.getAllClients()
            ResponseEntity.ok(clients)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    fun getClientById(@PathVariable id: Long): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.getClientById(id)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    fun createClient(@Valid @RequestBody clientRequest: ClientRequest): ResponseEntity<ClientResponse> {
        return try {
            val client = clientService.createClient(clientRequest)
            ResponseEntity.ok(client)
        } catch (e: Exception) {
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
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteClient(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return try {
            clientService.deleteClient(id)
            ResponseEntity.ok(MessageResponse("Client deactivated successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Failed to deactivate client"))
        }
    }

    @GetMapping("/search")
    fun searchClients(@RequestParam name: String): ResponseEntity<List<ClientResponse>> {
        return try {
            val clients = clientService.searchClients(name)
            ResponseEntity.ok(clients)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
} 