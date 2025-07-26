package com.clinic

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ClinicManagementApplication

fun main(args: Array<String>) {
    runApplication<ClinicManagementApplication>(*args)
}