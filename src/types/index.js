// User roles - used for documentation purposes
// 'SUPERADMIN' | 'EVENT_ADMIN' | 'SCAN_STAFF' | 'CUSTOMER'

// User status - used for documentation purposes
// 'active' | 'inactive'

// Event status - used for documentation purposes
// 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} role - UserRole
 * @property {string} status - UserStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} EventAdmin
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} role - 'EVENT_ADMIN'
 * @property {string} status - UserStatus
 * @property {number} [totalEvents]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} name
 * @property {string} organizerId
 * @property {string} organizerName
 * @property {string} status - EventStatus
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} venue
 * @property {number} totalTickets
 * @property {number} soldTickets
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalEvents
 * @property {number} totalEventAdmins
 * @property {number} totalOrders
 * @property {number} totalRevenue
 * @property {number} revenueGrowth
 * @property {number} ordersGrowth
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} EventAdminFormData
 * @property {string} [id]
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} status
 */

/**
 * @typedef {Object} PlatformSettings
 * @property {string} [platformName]
 * @property {string} [supportEmail]
 * @property {string} [timezone]
 * @property {string} [currency]
 */

export {};
