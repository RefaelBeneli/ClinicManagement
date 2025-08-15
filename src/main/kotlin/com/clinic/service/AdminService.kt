package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.*
import com.clinic.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class AdminService(
    private val userRepository: UserRepository,
    private val clientRepository: ClientRepository,
    private val meetingRepository: MeetingRepository,
    private val personalMeetingRepository: PersonalMeetingRepository,
    private val expenseRepository: ExpenseRepository,
    private val expenseCategoryRepository: ExpenseCategoryRepository,
    private val clientSourceRepository: ClientSourceRepository,
    private val paymentTypeRepository: PaymentTypeRepository,
    private val personalMeetingTypeRepository: PersonalMeetingTypeRepository,
    private val passwordEncoder: PasswordEncoder
) {

    // User Management
    fun getAllUsers(pageable: Pageable): Page<AdminUserResponse> {
        return userRepository.findAll(pageable).map { user ->
            AdminUserResponse(
                id = user.id,
                username = user.username,
                email = user.email,
                fullName = user.fullName,
                role = user.role.name,
                enabled = user.isEnabled,
                approvalStatus = user.approvalStatus.name,
                approvedBy = user.approvedBy?.fullName,
                approvedDate = user.approvedDate,
                rejectionReason = user.rejectionReason,
                createdAt = user.createdAt
            )
        }
    }



    fun getUserById(id: Long): AdminUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { RuntimeException("User not found with id: $id") }
        
        return AdminUserResponse(
            id = user.id,
            username = user.username,
            email = user.email,
            fullName = user.fullName,
            role = user.role.name,
            enabled = user.isEnabled,
            approvalStatus = user.approvalStatus.name,
            approvedBy = user.approvedBy?.fullName,
            approvedDate = user.approvedDate,
            rejectionReason = user.rejectionReason,
            createdAt = user.createdAt
        )
    }

    fun updateUser(id: Long, request: UpdateUserRequest): AdminUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { RuntimeException("User not found with id: $id") }

        val updatedUser = user.copy(
            email = request.email ?: user.email,
            fullName = request.fullName ?: user.fullName,
            role = request.role?.let { Role.valueOf(it) } ?: user.role,
            enabled = request.enabled ?: user.isEnabled
        )

        val saved = userRepository.save(updatedUser)
        return getUserById(saved.id)
    }

    private fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        val username = authentication.name
        return userRepository.findByUsername(username)
            .orElseThrow { RuntimeException("Current user not found") }
    }

    fun getPendingUsers(pageable: Pageable): Page<AdminUserResponse> {
        return userRepository.findByApprovalStatus(UserApprovalStatus.PENDING, pageable).map { user ->
            AdminUserResponse(
                id = user.id,
                username = user.username,
                email = user.email,
                fullName = user.fullName,
                role = user.role.name,
                enabled = user.isEnabled,
                approvalStatus = user.approvalStatus.name,
                approvedBy = user.approvedBy?.fullName,
                approvedDate = user.approvedDate,
                rejectionReason = user.rejectionReason,
                createdAt = user.createdAt
            )
        }
    }

    fun deleteUser(id: Long) {
        if (!userRepository.existsById(id)) {
            throw RuntimeException("User not found with id: $id")
        }
        userRepository.deleteById(id)
    }

    fun validateUserName(name: String): Boolean {
        return userRepository.findByFullNameContainingIgnoreCase(name).isNotEmpty()
    }

    fun approveUser(id: Long, request: ApproveUserRequest): AdminUserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { RuntimeException("User not found with id: $id") }
        
        val approvalStatus = UserApprovalStatus.valueOf(request.approvalStatus)
        val currentUser = getCurrentUser()
        
        val updatedUser = user.copy(
            approvalStatus = approvalStatus,
            approvedBy = if (approvalStatus == UserApprovalStatus.APPROVED) currentUser else null,
            approvedDate = if (approvalStatus == UserApprovalStatus.APPROVED) LocalDateTime.now() else null,
            rejectionReason = if (approvalStatus == UserApprovalStatus.REJECTED) request.rejectionReason else null,
            enabled = if (approvalStatus == UserApprovalStatus.APPROVED) true else user.isEnabled
        )
        
        val saved = userRepository.save(updatedUser)
        return getUserById(saved.id)
    }

    // Client Management
    fun getAllClients(pageable: Pageable): Page<AdminClientResponse> {
        return clientRepository.findAll(pageable).map { client ->
            AdminClientResponse(
                id = client.id,
                fullName = client.fullName,
                email = client.email,
                phone = client.phone,
                notes = client.notes,
                isActive = client.isActive,
                userId = client.user.id,
                userFullName = client.user.fullName,
                createdAt = client.createdAt
            )
        }
    }



    fun getClientById(id: Long): AdminClientResponse {
        val client = clientRepository.findById(id)
            .orElseThrow { RuntimeException("Client not found with id: $id") }
        
        return AdminClientResponse(
            id = client.id,
            fullName = client.fullName,
            email = client.email,
            phone = client.phone,
            notes = client.notes,
            isActive = client.isActive,
            userId = client.user.id,
            userFullName = client.user.fullName,
            createdAt = client.createdAt
        )
    }

    fun createClient(request: AdminClientRequest): AdminClientResponse {
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val source = clientSourceRepository.findById(request.sourceId)
            .orElseThrow { RuntimeException("Client source not found with id: ${request.sourceId}") }

        val client = Client(
            fullName = request.fullName,
            email = request.email,
            phone = request.phone,
            notes = request.notes,
            user = user,
            source = source
        )

        val saved = clientRepository.save(client)
        return getClientById(saved.id)
    }

    fun updateClient(id: Long, request: AdminClientRequest): AdminClientResponse {
        val client = clientRepository.findById(id)
            .orElseThrow { RuntimeException("Client not found with id: $id") }
        
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val source = clientSourceRepository.findById(request.sourceId)
            .orElseThrow { RuntimeException("Client source not found with id: ${request.sourceId}") }

        val updatedClient = client.copy(
            fullName = request.fullName,
            email = request.email,
            phone = request.phone,
            notes = request.notes,
            user = user,
            source = source
        )

        val saved = clientRepository.save(updatedClient)
        return getClientById(saved.id)
    }

    fun deleteClient(id: Long) {
        if (!clientRepository.existsById(id)) {
            throw RuntimeException("Client not found with id: $id")
        }
        clientRepository.deleteById(id)
    }

    // Meeting Management
    fun getAllMeetings(pageable: Pageable): Page<AdminMeetingResponse> {
        return meetingRepository.findAll(pageable).map { meeting ->
            AdminMeetingResponse(
                id = meeting.id,
                clientId = meeting.client.id,
                clientFullName = meeting.client.fullName,
                userId = meeting.user.id,
                userFullName = meeting.user.fullName,
                meetingDate = meeting.meetingDate,
                duration = meeting.duration,
                price = meeting.price,
                isPaid = meeting.isPaid,
                paymentDate = meeting.paymentDate,
                status = meeting.status.name,
                notes = meeting.notes,
                createdAt = meeting.createdAt
            )
        }
    }

    fun getAllMeetingsWithoutPagination(): List<AdminMeetingResponse> {
        return meetingRepository.findAll().map { meeting ->
            AdminMeetingResponse(
                id = meeting.id,
                clientId = meeting.client.id,
                clientFullName = meeting.client.fullName,
                userId = meeting.user.id,
                userFullName = meeting.user.fullName,
                meetingDate = meeting.meetingDate,
                duration = meeting.duration,
                price = meeting.price,
                isPaid = meeting.isPaid,
                paymentDate = meeting.paymentDate,
                status = meeting.status.name,
                notes = meeting.notes,
                createdAt = meeting.createdAt
            )
        }
    }

    fun getMeetingById(id: Long): AdminMeetingResponse {
        val meeting = meetingRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting not found with id: $id") }
        
        return AdminMeetingResponse(
            id = meeting.id,
            clientId = meeting.client.id,
            clientFullName = meeting.client.fullName,
            userId = meeting.user.id,
            userFullName = meeting.user.fullName,
            meetingDate = meeting.meetingDate,
            duration = meeting.duration,
            price = meeting.price,
            isPaid = meeting.isPaid,
            paymentDate = meeting.paymentDate,
            status = meeting.status.name,
            notes = meeting.notes,
            createdAt = meeting.createdAt
        )
    }

    fun createMeeting(request: AdminMeetingRequest): AdminMeetingResponse {
        val client = clientRepository.findById(request.clientId)
            .orElseThrow { RuntimeException("Client not found with id: ${request.clientId}") }
        
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val paymentType = if (request.paymentTypeId != null) {
            paymentTypeRepository.findById(request.paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: ${request.paymentTypeId}") }
        } else null

        val meeting = Meeting(
            client = client,
            user = user,
            meetingDate = request.meetingDate,
            duration = request.duration,
            price = request.price,
            isPaid = request.isPaid,
            paymentDate = request.paymentDate,
            paymentType = paymentType,
            status = MeetingStatus.valueOf(request.status),
            notes = request.notes
        )

        val saved = meetingRepository.save(meeting)
        return getMeetingById(saved.id)
    }

    fun updateMeeting(id: Long, request: AdminMeetingRequest): AdminMeetingResponse {
        val meeting = meetingRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting not found with id: $id") }
        
        val client = clientRepository.findById(request.clientId)
            .orElseThrow { RuntimeException("Client not found with id: ${request.clientId}") }
        
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val paymentType = if (request.paymentTypeId != null) {
            paymentTypeRepository.findById(request.paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: ${request.paymentTypeId}") }
        } else null

        val updatedMeeting = meeting.copy(
            client = client,
            user = user,
            meetingDate = request.meetingDate,
            duration = request.duration,
            price = request.price,
            isPaid = request.isPaid,
            paymentDate = request.paymentDate,
            paymentType = paymentType,
            status = MeetingStatus.valueOf(request.status),
            notes = request.notes
        )

        val saved = meetingRepository.save(updatedMeeting)
        return getMeetingById(saved.id)
    }

    fun deleteMeeting(id: Long) {
        if (!meetingRepository.existsById(id)) {
            throw RuntimeException("Meeting not found with id: $id")
        }
        meetingRepository.deleteById(id)
    }

    // Personal Meeting Management
    fun getAllPersonalMeetings(pageable: Pageable): Page<AdminPersonalMeetingResponse> {
        return personalMeetingRepository.findAll(pageable).map { meeting ->
            AdminPersonalMeetingResponse(
                id = meeting.id,
                userId = meeting.user.id,
                userFullName = meeting.user.fullName,
                therapistName = meeting.therapistName,
                meetingType = meeting.meetingType?.name ?: "Unknown Type",
                providerType = meeting.providerType,
                providerCredentials = meeting.providerCredentials,
                meetingDate = meeting.meetingDate,
                duration = meeting.duration,
                price = meeting.price,
                isPaid = meeting.isPaid,
                paymentDate = meeting.paymentDate,
                status = meeting.status.name,
                notes = meeting.notes,
                createdAt = meeting.createdAt
            )
        }
    }

    fun getAllPersonalMeetingsWithoutPagination(): List<AdminPersonalMeetingResponse> {
        return personalMeetingRepository.findAll().map { meeting ->
            AdminPersonalMeetingResponse(
                id = meeting.id,
                userId = meeting.user.id,
                userFullName = meeting.user.fullName,
                therapistName = meeting.therapistName,
                meetingType = meeting.meetingType?.name ?: "Unknown Type",
                providerType = meeting.providerType,
                providerCredentials = meeting.providerCredentials,
                meetingDate = meeting.meetingDate,
                duration = meeting.duration,
                price = meeting.price,
                isPaid = meeting.isPaid,
                paymentDate = meeting.paymentDate,
                status = meeting.status.name,
                notes = meeting.notes,
                createdAt = meeting.createdAt
            )
        }
    }

    fun getPersonalMeetingById(id: Long): AdminPersonalMeetingResponse {
        val meeting = personalMeetingRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting not found with id: $id") }
        
        return AdminPersonalMeetingResponse(
            id = meeting.id,
            userId = meeting.user.id,
            userFullName = meeting.user.fullName,
            therapistName = meeting.therapistName,
            meetingType = meeting.meetingType?.name ?: "Unknown Type",
            providerType = meeting.providerType,
            providerCredentials = meeting.providerCredentials,
            meetingDate = meeting.meetingDate,
            duration = meeting.duration,
            price = meeting.price,
            isPaid = meeting.isPaid,
            paymentDate = meeting.paymentDate,
            status = meeting.status.name,
            notes = meeting.notes,
            createdAt = meeting.createdAt
        )
    }

    fun createPersonalMeeting(request: AdminPersonalMeetingRequest): AdminPersonalMeetingResponse {
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val meetingType = personalMeetingTypeRepository.findById(request.meetingTypeId)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: ${request.meetingTypeId}") }

        val meeting = PersonalMeeting(
            user = user,
            therapistName = request.therapistName,
            meetingType = meetingType,
            providerType = request.providerType,
            providerCredentials = request.providerCredentials,
            meetingDate = request.meetingDate,
            duration = request.duration,
            price = request.price,
            isPaid = request.isPaid,
            paymentDate = request.paymentDate,
            status = PersonalMeetingStatus.valueOf(request.status),
            notes = request.notes
        )

        val saved = personalMeetingRepository.save(meeting)
        return getPersonalMeetingById(saved.id)
    }

    fun updatePersonalMeeting(id: Long, request: AdminPersonalMeetingRequest): AdminPersonalMeetingResponse {
        val meeting = personalMeetingRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting not found with id: $id") }
        
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val meetingType = personalMeetingTypeRepository.findById(request.meetingTypeId)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: ${request.meetingTypeId}") }

        val updatedMeeting = meeting.copy(
            user = user,
            therapistName = request.therapistName,
            meetingType = meetingType,
            providerType = request.providerType,
            providerCredentials = request.providerCredentials,
            meetingDate = request.meetingDate,
            duration = request.duration,
            price = request.price,
            isPaid = request.isPaid,
            paymentDate = request.paymentDate,
            status = PersonalMeetingStatus.valueOf(request.status),
            notes = request.notes
        )

        val saved = personalMeetingRepository.save(updatedMeeting)
        return getPersonalMeetingById(saved.id)
    }

    fun deletePersonalMeeting(id: Long) {
        if (!personalMeetingRepository.existsById(id)) {
            throw RuntimeException("Personal meeting not found with id: $id")
        }
        personalMeetingRepository.deleteById(id)
    }

    // Expense Management
    fun getAllExpenses(pageable: Pageable): Page<AdminExpenseResponse> {
        return expenseRepository.findAll(pageable).map { expense ->
            AdminExpenseResponse(
                id = expense.id,
                userId = expense.user.id,
                userFullName = expense.user.fullName,
                name = expense.name,
                description = expense.description,
                amount = expense.amount,
                currency = expense.currency,
                categoryId = expense.category.id,
                categoryName = expense.category.name,
                notes = expense.notes,
                expenseDate = expense.expenseDate.atStartOfDay(),
                isRecurring = expense.isRecurring,
                recurrenceFrequency = expense.recurrenceFrequency,
                recurrenceCount = expense.recurrenceCount,
                nextDueDate = expense.nextDueDate?.atStartOfDay(),
                isPaid = expense.isPaid,
                paymentTypeId = expense.paymentType?.id,
                paymentTypeName = expense.paymentType?.name,
                receiptUrl = expense.receiptUrl,
                isActive = expense.isActive,
                createdAt = expense.createdAt
            )
        }
    }

    fun getAllExpensesWithoutPagination(): List<AdminExpenseResponse> {
        return expenseRepository.findAll().map { expense ->
            AdminExpenseResponse(
                id = expense.id,
                userId = expense.user.id,
                userFullName = expense.user.fullName,
                name = expense.name,
                description = expense.description,
                amount = expense.amount,
                currency = expense.currency,
                categoryId = expense.category.id,
                categoryName = expense.category.name,
                notes = expense.notes,
                expenseDate = expense.expenseDate.atStartOfDay(),
                isRecurring = expense.isRecurring,
                recurrenceFrequency = expense.recurrenceFrequency,
                recurrenceCount = expense.recurrenceCount,
                nextDueDate = expense.nextDueDate?.atStartOfDay(),
                isPaid = expense.isPaid,
                paymentTypeId = expense.paymentType?.id,
                paymentTypeName = expense.paymentType?.name,
                receiptUrl = expense.receiptUrl,
                isActive = expense.isActive,
                createdAt = expense.createdAt
            )
        }
    }

    fun getExpenseById(id: Long): AdminExpenseResponse {
        val expense = expenseRepository.findById(id)
            .orElseThrow { RuntimeException("Expense not found with id: $id") }
        
        return AdminExpenseResponse(
            id = expense.id,
            userId = expense.user.id,
            userFullName = expense.user.fullName,
            name = expense.name,
            description = expense.description,
            amount = expense.amount,
            currency = expense.currency,
            categoryId = expense.category.id,
            categoryName = expense.category.name,
            notes = expense.notes,
            expenseDate = expense.expenseDate.atStartOfDay(),
            isRecurring = expense.isRecurring,
            recurrenceFrequency = expense.recurrenceFrequency,
            recurrenceCount = expense.recurrenceCount,
            nextDueDate = expense.nextDueDate?.atStartOfDay(),
            isPaid = expense.isPaid,
            paymentTypeId = expense.paymentType?.id,
            paymentTypeName = expense.paymentType?.name,
            receiptUrl = expense.receiptUrl,
            isActive = expense.isActive,
            createdAt = expense.createdAt
        )
    }

    fun createExpense(request: AdminExpenseCreateRequest): AdminExpenseResponse {
        val user = userRepository.findById(request.userId)
            .orElseThrow { RuntimeException("User not found with id: ${request.userId}") }

        val category = expenseCategoryRepository.findById(request.categoryId)
            .orElseThrow { RuntimeException("Expense category not found with id: ${request.categoryId}") }

        val paymentType = request.paymentTypeId?.let { paymentTypeId ->
            paymentTypeRepository.findById(paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: $paymentTypeId") }
        }

        val expense = Expense(
            user = user,
            name = request.name,
            description = request.description,
            amount = request.amount,
            currency = request.currency,
            category = category,
            notes = request.notes,
            expenseDate = request.expenseDate.toLocalDate(),
            isRecurring = request.isRecurring,
            recurrenceFrequency = request.recurrenceFrequency,
            recurrenceCount = request.recurrenceCount,
            nextDueDate = request.nextDueDate?.toLocalDate(),
            isPaid = request.isPaid,
            paymentType = paymentType,
            receiptUrl = request.receiptUrl
        )

        val saved = expenseRepository.save(expense)
        return getExpenseById(saved.id)
    }

    fun updateExpense(id: Long, request: AdminExpenseRequest): AdminExpenseResponse {
        val expense = expenseRepository.findById(id)
            .orElseThrow { RuntimeException("Expense not found with id: $id") }
        
        val user = request.userId?.let { userId ->
            userRepository.findById(userId)
                .orElseThrow { RuntimeException("User not found with id: $userId") }
        } ?: expense.user

        val category = request.categoryId?.let { categoryId ->
            expenseCategoryRepository.findById(categoryId)
                .orElseThrow { RuntimeException("Expense category not found with id: $categoryId") }
        } ?: expense.category

        val paymentType = request.paymentTypeId?.let { paymentTypeId ->
            paymentTypeRepository.findById(paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: $paymentTypeId") }
        } ?: expense.paymentType

        // Only update fields that are actually provided in the request
        val updatedExpense = expense.copy(
            user = user,
            name = request.name ?: expense.name,
            description = request.description ?: expense.description,
            amount = request.amount ?: expense.amount,
            currency = request.currency ?: expense.currency,
            category = category,
            notes = request.notes,
            expenseDate = request.expenseDate?.toLocalDate() ?: expense.expenseDate,
            isRecurring = request.isRecurring ?: expense.isRecurring,
            recurrenceFrequency = request.recurrenceFrequency,
            recurrenceCount = request.recurrenceCount ?: expense.recurrenceCount,
            nextDueDate = request.nextDueDate?.toLocalDate(),
            isPaid = request.isPaid ?: expense.isPaid,
            paymentType = paymentType,
            receiptUrl = request.receiptUrl,
            isActive = request.isActive ?: expense.isActive,
            updatedAt = LocalDateTime.now()
        )

        val saved = expenseRepository.save(updatedExpense)
        return getExpenseById(saved.id)
    }

    fun deleteExpense(id: Long) {
        if (!expenseRepository.existsById(id)) {
            throw RuntimeException("Expense not found with id: $id")
        }
        expenseRepository.deleteById(id)
    }

    // Dashboard Methods
    fun getTodaysSessions(): List<AdminMeetingResponse> {
        val today = LocalDateTime.now().toLocalDate()
        return meetingRepository.findByMeetingDate(today).map { meeting ->
            AdminMeetingResponse(
                id = meeting.id,
                clientId = meeting.client.id,
                clientFullName = meeting.client.fullName,
                userId = meeting.user.id,
                userFullName = meeting.user.fullName,
                meetingDate = meeting.meetingDate,
                duration = meeting.duration,
                price = meeting.price,
                isPaid = meeting.isPaid,
                paymentDate = meeting.paymentDate,
                status = meeting.status.name,
                notes = meeting.notes,
                createdAt = meeting.createdAt
            )
        }
    }

    fun getRecentActivity(): List<Map<String, Any>> {
        val recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc()
        val recentMeetings = meetingRepository.findTop5ByOrderByCreatedAtDesc()
        val recentExpenses = expenseRepository.findTop5ByOrderByCreatedAtDesc()

        val activities = mutableListOf<Map<String, Any>>()

        recentUsers.forEach { user ->
            activities.add(mapOf(
                "type" to "user_created",
                "message" to "New user registered: ${user.fullName}",
                "timestamp" to user.createdAt,
                "entityId" to user.id
            ))
        }

        recentMeetings.forEach { meeting ->
            activities.add(mapOf(
                "type" to "meeting_created",
                "message" to "New meeting scheduled with ${meeting.client.fullName}",
                "timestamp" to meeting.createdAt,
                "entityId" to meeting.id
            ))
        }

        recentExpenses.forEach { expense ->
            activities.add(mapOf(
                "type" to "expense_created",
                "message" to "New expense added: ${expense.name}",
                "timestamp" to expense.createdAt,
                "entityId" to expense.id
            ))
        }

        return activities.sortedByDescending { it["timestamp"] as LocalDateTime }.take(10)
    }
} 