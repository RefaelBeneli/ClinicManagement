package com.clinic.controller

import com.clinic.dto.ClientSourceRequest
import com.clinic.dto.ClientSourceResponse
import com.clinic.dto.UpdateClientSourceRequest
import com.clinic.service.ClientSourceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/client-sources")
class ClientSourceController(
    private val clientSourceService: ClientSourceService
) {

    @GetMapping
    fun getAllSources(): ResponseEntity<List<ClientSourceResponse>> {
        val sources = clientSourceService.getAllSources()
        return ResponseEntity.ok(sources)
    }

    @GetMapping("/active")
    fun getActiveSources(): ResponseEntity<List<ClientSourceResponse>> {
        val sources = clientSourceService.getActiveSources()
        return ResponseEntity.ok(sources)
    }

    @GetMapping("/{id}")
    fun getSourceById(@PathVariable id: Long): ResponseEntity<ClientSourceResponse> {
        val source = clientSourceService.getSourceById(id)
        return ResponseEntity.ok(source)
    }

    @PostMapping
    fun createSource(@RequestBody request: ClientSourceRequest): ResponseEntity<ClientSourceResponse> {
        val source = clientSourceService.createSource(request)
        return ResponseEntity.ok(source)
    }

    @PutMapping("/{id}")
    fun updateSource(
        @PathVariable id: Long,
        @RequestBody request: UpdateClientSourceRequest
    ): ResponseEntity<ClientSourceResponse> {
        val source = clientSourceService.updateSource(id, request)
        return ResponseEntity.ok(source)
    }

    @DeleteMapping("/{id}")
    fun deleteSource(@PathVariable id: Long): ResponseEntity<Unit> {
        clientSourceService.deleteSource(id)
        return ResponseEntity.ok().build()
    }

    @PatchMapping("/{id}/toggle")
    fun toggleSourceActive(@PathVariable id: Long): ResponseEntity<ClientSourceResponse> {
        val source = clientSourceService.toggleSourceActive(id)
        return ResponseEntity.ok(source)
    }
} 