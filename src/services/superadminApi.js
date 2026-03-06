// Simulated delay for realistic API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockEventAdmins = [
  {
    id: '1',
    fullName: 'Budi Santoso',
    email: 'budi@eventpro.id',
    phone: '+62812345678',
    role: 'EVENT_ADMIN',
    status: 'active',
    totalEvents: 12,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-11-20T10:30:00Z',
  },
  {
    id: '2',
    fullName: 'Siti Rahayu',
    email: 'siti@musicfest.co',
    phone: '+62823456789',
    role: 'EVENT_ADMIN',
    status: 'active',
    totalEvents: 8,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-11-18T14:20:00Z',
  },
  {
    id: '3',
    fullName: 'Ahmad Wijaya',
    email: 'ahmad@concertindo.com',
    phone: '+62834567890',
    role: 'EVENT_ADMIN',
    status: 'inactive',
    totalEvents: 5,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: '4',
    fullName: 'Dewi Lestari',
    email: 'dewi@liveshow.id',
    phone: '+62845678901',
    role: 'EVENT_ADMIN',
    status: 'active',
    totalEvents: 15,
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-11-22T16:45:00Z',
  },
  {
    id: '5',
    fullName: 'Rudi Hartono',
    email: 'rudi@stagecraft.id',
    phone: '+62856789012',
    role: 'EVENT_ADMIN',
    status: 'active',
    totalEvents: 3,
    createdAt: '2024-05-12T08:30:00Z',
    updatedAt: '2024-11-10T11:15:00Z',
  },
];

const mockUsers = [
  ...mockEventAdmins,
  {
    id: '100',
    fullName: 'Super Admin',
    email: 'superadmin@tiketku.id',
    role: 'SUPERADMIN',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '101',
    fullName: 'Scan Staff 1',
    email: 'scan1@tiketku.id',
    phone: '+62811111111',
    role: 'SCAN_STAFF',
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '102',
    fullName: 'Customer Andi',
    email: 'andi@gmail.com',
    phone: '+62822222222',
    role: 'CUSTOMER',
    status: 'active',
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];

const mockEvents = [
  {
    id: '1',
    name: 'Java Jazz Festival 2025',
    organizerId: '1',
    organizerName: 'Budi Santoso',
    status: 'published',
    startDate: '2025-03-01T18:00:00Z',
    endDate: '2025-03-03T23:59:59Z',
    venue: 'Jakarta Convention Center',
    totalTickets: 5000,
    soldTickets: 3500,
    createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Music Festival 2025',
    organizerId: '2',
    organizerName: 'Siti Rahayu',
    status: 'ongoing',
    startDate: '2024-12-15T16:00:00Z',
    endDate: '2024-12-17T23:59:59Z',
    venue: 'Gelora Bung Karno Stadium',
    totalTickets: 10000,
    soldTickets: 8500,
    createdAt: '2024-10-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Comedy Show Night',
    organizerId: '1',
    organizerName: 'Budi Santoso',
    status: 'draft',
    startDate: '2025-01-20T19:00:00Z',
    endDate: '2025-01-20T23:00:00Z',
    venue: 'Istora Senayan',
    totalTickets: 2000,
    soldTickets: 0,
    createdAt: '2024-11-10T10:00:00Z',
  },
];

// Dashboard API functions
export async function getDashboardStats() {
  await delay(500);
  return {
    totalEvents: 45,
    totalEventAdmins: 5,
    totalOrders: 12500,
    totalRevenue: 2500000000,
    revenueGrowth: 15.5,
    ordersGrowth: 8.2,
  };
}

export async function getLatestEvents(limit = 5) {
  await delay(400);
  return mockEvents.slice(0, limit);
}

// Event Admin API functions
export async function getEventAdmins(page = 1, pageSize = 10, search = '') {
  await delay(500);
  
  let filtered = mockEventAdmins;
  if (search) {
    filtered = filtered.filter(admin =>
      admin.fullName.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createEventAdmin(adminData) {
  await delay(600);
  const newAdmin = {
    id: String(mockEventAdmins.length + 1),
    ...adminData,
    totalEvents: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEventAdmins.push(newAdmin);
  return newAdmin;
}

export async function updateEventAdmin(id, adminData) {
  await delay(500);
  const admin = mockEventAdmins.find(a => a.id === id);
  if (!admin) throw new Error('Admin not found');
  
  const updated = {
    ...admin,
    ...adminData,
    id: admin.id,
    updatedAt: new Date().toISOString(),
  };
  
  const index = mockEventAdmins.findIndex(a => a.id === id);
  mockEventAdmins[index] = updated;
  return updated;
}

export async function deleteEventAdmin(id) {
  await delay(400);
  const index = mockEventAdmins.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Admin not found');
  
  mockEventAdmins.splice(index, 1);
  return { success: true };
}

// Event API functions
export async function getEvents(page = 1, pageSize = 10, search = '', status = 'all') {
  await delay(500);
  
  let filtered = mockEvents;
  if (search) {
    filtered = filtered.filter(event =>
      event.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (status !== 'all') {
    filtered = filtered.filter(event => event.status === status);
  }
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getEventById(id) {
  await delay(300);
  const event = mockEvents.find(e => e.id === id);
  if (!event) throw new Error('Event not found');
  return event;
}

// User API functions
export async function getUsers(page = 1, pageSize = 10, search = '', role = 'all') {
  await delay(500);
  
  let filtered = mockUsers;
  if (search) {
    filtered = filtered.filter(user =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (role !== 'all') {
    filtered = filtered.filter(user => user.role === role);
  }
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function updateUserStatus(id, status) {
  await delay(400);
  const user = mockUsers.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  
  user.status = status;
  user.updatedAt = new Date().toISOString();
  return user;
}

// Settings API functions
export async function getPlatformSettings() {
  await delay(300);
  return {
    platformName: 'Tiket.ku',
    supportEmail: 'support@tiketku.id',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
  };
}

export async function updatePlatformSettings(settings) {
  await delay(400);
  return {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
}
