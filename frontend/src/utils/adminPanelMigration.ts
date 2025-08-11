/**
 * Admin Panel Migration Utility
 * 
 * This script helps migrate from the old fragmented admin panel structure
 * to the new unified admin panel design.
 */

import { User, Client, Meeting, Expense } from '../types';

export interface MigrationStats {
  usersMigrated: number;
  clientsMigrated: number;
  meetingsMigrated: number;
  expensesMigrated: number;
  errors: string[];
  warnings: string[];
}

export interface MigrationOptions {
  dryRun?: boolean;
  backupData?: boolean;
  validateData?: boolean;
  skipErrors?: boolean;
}

/**
 * Migrates user data from old admin panel format to new format
 */
export const migrateUsers = async (
  oldUsers: any[],
  options: MigrationOptions = {}
): Promise<{ users: User[]; stats: MigrationStats }> => {
  const stats: MigrationStats = {
    usersMigrated: 0,
    clientsMigrated: 0,
    meetingsMigrated: 0,
    expensesMigrated: 0,
    errors: [],
    warnings: []
  };

  const migratedUsers: User[] = [];

  for (const oldUser of oldUsers) {
    try {
      // Transform old user format to new format
      const newUser: User = {
        id: oldUser.id || oldUser.userId,
        username: oldUser.username || oldUser.email,
        email: oldUser.email,
        fullName: oldUser.fullName || oldUser.firstName || oldUser.first_name || `${oldUser.firstName || oldUser.first_name || ''} ${oldUser.lastName || oldUser.last_name || ''}`.trim(),
        role: oldUser.role || 'USER',
        // Add any additional fields that need transformation
      };

      if (options.validateData) {
        if (!newUser.email || !newUser.fullName) {
          stats.warnings.push(`User ${oldUser.id} missing required fields`);
        }
      }

      migratedUsers.push(newUser);
      stats.usersMigrated++;

    } catch (error) {
      const errorMsg = `Failed to migrate user ${oldUser.id}: ${error}`;
      stats.errors.push(errorMsg);
      
      if (!options.skipErrors) {
        throw new Error(errorMsg);
      }
    }
  }

  return { users: migratedUsers, stats };
};

/**
 * Migrates client data from old admin panel format to new format
 */
export const migrateClients = async (
  oldClients: any[],
  options: MigrationOptions = {}
): Promise<{ clients: Client[]; stats: MigrationStats }> => {
  const stats: MigrationStats = {
    usersMigrated: 0,
    clientsMigrated: 0,
    meetingsMigrated: 0,
    expensesMigrated: 0,
    errors: [],
    warnings: []
  };

  const migratedClients: Client[] = [];

  for (const oldClient of oldClients) {
    try {
      // Transform old client format to new format
      const newClient: Client = {
        id: oldClient.id || oldClient.clientId,
        fullName: oldClient.fullName || oldClient.firstName || oldClient.first_name || `${oldClient.firstName || oldClient.first_name || ''} ${oldClient.lastName || oldClient.last_name || ''}`.trim(),
        email: oldClient.email,
        phone: oldClient.phone,
        notes: oldClient.notes,
        createdAt: oldClient.createdAt || oldClient.created_at || new Date().toISOString(),
        active: oldClient.active !== false,
        // Add any additional fields that need transformation
      };

      if (options.validateData) {
        if (!newClient.fullName) {
          stats.warnings.push(`Client ${oldClient.id} missing required fields`);
        }
      }

      migratedClients.push(newClient);
      stats.clientsMigrated++;

    } catch (error) {
      const errorMsg = `Failed to migrate client ${oldClient.id}: ${error}`;
      stats.errors.push(errorMsg);
      
      if (!options.skipErrors) {
        throw new Error(errorMsg);
      }
    }
  }

  return { clients: migratedClients, stats };
};

/**
 * Migrates meeting data from old admin panel format to new format
 */
export const migrateMeetings = async (
  oldMeetings: any[],
  options: MigrationOptions = {}
): Promise<{ meetings: Meeting[]; stats: MigrationStats }> => {
  const stats: MigrationStats = {
    usersMigrated: 0,
    clientsMigrated: 0,
    meetingsMigrated: 0,
    expensesMigrated: 0,
    errors: [],
    warnings: []
  };

  const migratedMeetings: Meeting[] = [];

  for (const oldMeeting of oldMeetings) {
    try {
      // Transform old meeting format to new format
      const newMeeting: Meeting = {
        id: oldMeeting.id || oldMeeting.meetingId,
        client: oldMeeting.client,
        source: oldMeeting.source,
        meetingDate: oldMeeting.meetingDate || oldMeeting.meeting_date || oldMeeting.startTime || oldMeeting.start_time,
        duration: oldMeeting.duration || 60,
        price: oldMeeting.price || 0,
        isPaid: oldMeeting.isPaid || oldMeeting.is_paid || false,
        notes: oldMeeting.notes,
        summary: oldMeeting.summary,
        status: oldMeeting.status || 'SCHEDULED',
        isRecurring: oldMeeting.isRecurring || oldMeeting.is_recurring || false,
        sessionNumber: oldMeeting.sessionNumber || oldMeeting.session_number || 1,
        createdAt: oldMeeting.createdAt || oldMeeting.created_at || new Date().toISOString(),
        active: oldMeeting.active !== false,
        // Add any additional fields that need transformation
      };

      if (options.validateData) {
        if (!newMeeting.client || !newMeeting.source || !newMeeting.meetingDate) {
          stats.warnings.push(`Meeting ${oldMeeting.id} missing required fields`);
        }
      }

      migratedMeetings.push(newMeeting);
      stats.meetingsMigrated++;

    } catch (error) {
      const errorMsg = `Failed to migrate meeting ${oldMeeting.id}: ${error}`;
      stats.errors.push(errorMsg);
      
      if (!options.skipErrors) {
        throw new Error(errorMsg);
      }
    }
  }

  return { meetings: migratedMeetings, stats };
};

/**
 * Migrates expense data from old admin panel format to new format
 */
export const migrateExpenses = async (
  oldExpenses: any[],
  options: MigrationOptions = {}
): Promise<{ expenses: Expense[]; stats: MigrationStats }> => {
  const stats: MigrationStats = {
    usersMigrated: 0,
    clientsMigrated: 0,
    meetingsMigrated: 0,
    expensesMigrated: 0,
    errors: [],
    warnings: []
  };

  const migratedExpenses: Expense[] = [];

  for (const oldExpense of oldExpenses) {
    try {
      // Transform old expense format to new format
      const newExpense: Expense = {
        id: oldExpense.id || oldExpense.expenseId,
        name: oldExpense.name || oldExpense.description,
        description: oldExpense.description,
        amount: oldExpense.amount,
        currency: oldExpense.currency || 'USD',
        category: oldExpense.category,
        notes: oldExpense.notes,
        expenseDate: oldExpense.expenseDate || oldExpense.expense_date || oldExpense.date,
        isRecurring: oldExpense.isRecurring || oldExpense.is_recurring || false,
        recurrenceFrequency: oldExpense.recurrenceFrequency || oldExpense.recurrence_frequency,
        isPaid: oldExpense.isPaid || oldExpense.is_paid || false,
        receiptUrl: oldExpense.receiptUrl || oldExpense.receipt_url,
        createdAt: oldExpense.createdAt || oldExpense.created_at || new Date().toISOString(),
        updatedAt: oldExpense.updatedAt || oldExpense.updated_at || new Date().toISOString(),
        isActive: oldExpense.active !== false,
        // Add any additional fields that need transformation
      };

      if (options.validateData) {
        if (!newExpense.name || !newExpense.amount || !newExpense.category) {
          stats.warnings.push(`Expense ${oldExpense.id} missing required fields`);
        }
      }

      migratedExpenses.push(newExpense);
      stats.expensesMigrated++;

    } catch (error) {
      const errorMsg = `Failed to migrate expense ${oldExpense.id}: ${error}`;
      stats.errors.push(errorMsg);
      
      if (!options.skipErrors) {
        throw new Error(errorMsg);
      }
    }
  }

  return { expenses: migratedExpenses, stats };
};

/**
 * Performs a full migration of all data types
 */
export const performFullMigration = async (
  oldData: {
    users?: any[];
    clients?: any[];
    meetings?: any[];
    expenses?: any[];
  },
  options: MigrationOptions = {}
): Promise<{
  users: User[];
  clients: Client[];
  meetings: Meeting[];
  expenses: Expense[];
  stats: MigrationStats;
}> => {
  const results = {
    users: [] as User[],
    clients: [] as Client[],
    meetings: [] as Meeting[],
    expenses: [] as Expense[],
    stats: {
      usersMigrated: 0,
      clientsMigrated: 0,
      meetingsMigrated: 0,
      expensesMigrated: 0,
      errors: [] as string[],
      warnings: [] as string[]
    }
  };

  try {
    // Migrate users
    if (oldData.users && oldData.users.length > 0) {
      const userResult = await migrateUsers(oldData.users, options);
      results.users = userResult.users;
      results.stats.usersMigrated = userResult.stats.usersMigrated;
      results.stats.errors.push(...userResult.stats.errors);
      results.stats.warnings.push(...userResult.stats.warnings);
    }

    // Migrate clients
    if (oldData.clients && oldData.clients.length > 0) {
      const clientResult = await migrateClients(oldData.clients, options);
      results.clients = clientResult.clients;
      results.stats.clientsMigrated = clientResult.stats.clientsMigrated;
      results.stats.errors.push(...clientResult.stats.errors);
      results.stats.warnings.push(...clientResult.stats.warnings);
    }

    // Migrate meetings
    if (oldData.meetings && oldData.meetings.length > 0) {
      const meetingResult = await migrateMeetings(oldData.meetings, options);
      results.meetings = meetingResult.meetings;
      results.stats.meetingsMigrated = meetingResult.stats.meetingsMigrated;
      results.stats.errors.push(...meetingResult.stats.errors);
      results.stats.warnings.push(...meetingResult.stats.warnings);
    }

    // Migrate expenses
    if (oldData.expenses && oldData.expenses.length > 0) {
      const expenseResult = await migrateExpenses(oldData.expenses, options);
      results.expenses = expenseResult.expenses;
      results.stats.expensesMigrated = expenseResult.stats.expensesMigrated;
      results.stats.errors.push(...expenseResult.stats.errors);
      results.stats.warnings.push(...expenseResult.stats.warnings);
    }

    console.log('Migration completed successfully!');
    console.log('Migration stats:', results.stats);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  return results;
};

/**
 * Validates that migrated data is in the correct format
 */
export const validateMigratedData = (
  data: {
    users?: User[];
    clients?: Client[];
    meetings?: Meeting[];
    expenses?: Expense[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate users
  if (data.users) {
    data.users.forEach((user, index) => {
      if (!user.email || !user.fullName) {
        errors.push(`User at index ${index} missing required fields`);
      }
    });
  }

  // Validate clients
  if (data.clients) {
    data.clients.forEach((client, index) => {
      if (!client.fullName) {
        errors.push(`Client at index ${index} missing required fields`);
      }
    });
  }

  // Validate meetings
  if (data.meetings) {
    data.meetings.forEach((meeting, index) => {
      if (!meeting.client || !meeting.source || !meeting.meetingDate) {
        errors.push(`Meeting at index ${index} missing required fields`);
      }
    });
  }

  // Validate expenses
  if (data.expenses) {
    data.expenses.forEach((expense, index) => {
      if (!expense.name || !expense.amount || !expense.category) {
        errors.push(`Expense at index ${index} missing required fields`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  migrateUsers,
  migrateClients,
  migrateMeetings,
  migrateExpenses,
  performFullMigration,
  validateMigratedData
}; 