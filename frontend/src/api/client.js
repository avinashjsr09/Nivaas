import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Initial Mock Data Store for standalone / GitHub Pages offline mode
const DEMO_SOCIETY = {
  id: 1,
  name: 'Green Heights Society',
  code: 'GH101',
  address: '100 Palm Avenue, Bandra',
  city: 'Mumbai',
  total_flats: 120
};

const DEMO_USERS = [
  {
    id: 1,
    name: 'Rajesh Sharma (Secretary)',
    email: 'admin@nivaas.com',
    password: 'password123',
    role: 'ADMIN',
    society_id: 1,
    society_name: 'Green Heights Society',
    society_code: 'GH101',
    flat_number: 'A-101',
    is_approved: 1
  },
  {
    id: 2,
    name: 'Priya Verma (Resident)',
    email: 'resident@nivaas.com',
    password: 'password123',
    role: 'RESIDENT',
    society_id: 1,
    society_name: 'Green Heights Society',
    society_code: 'GH101',
    flat_number: 'B-402',
    is_approved: 1
  },
  {
    id: 3,
    name: 'Ramesh Kumar (Security)',
    email: 'security@nivaas.com',
    password: 'password123',
    role: 'SECURITY',
    society_id: 1,
    society_name: 'Green Heights Society',
    society_code: 'GH101',
    flat_number: 'Main Gate',
    is_approved: 1
  }
];

function getStoredMockData(key, fallback) {
  try {
    const data = localStorage.getItem(`nivaas_mock_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredMockData(key, value) {
  try {
    localStorage.setItem(`nivaas_mock_${key}`, JSON.stringify(value));
  } catch (e) {}
}

// API Helper wrapper with automatic live backend / fallback handling
export const api = {
  async login(email, password) {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      return res.data;
    } catch (err) {
      console.warn('Real backend unavailable, using fallback mock auth engine:', err.message);
      const normalizedEmail = (email || '').toLowerCase().trim();
      const storedUsers = getStoredMockData('users', []);
      const allUsers = [...DEMO_USERS, ...storedUsers];
      
      let user = allUsers.find(u => u.email.toLowerCase().trim() === normalizedEmail);

      // If demo email, generate fallback user if missing
      if (!user) {
        if (normalizedEmail === 'admin@nivaas.com') user = DEMO_USERS[0];
        else if (normalizedEmail === 'resident@nivaas.com') user = DEMO_USERS[1];
        else if (normalizedEmail === 'security@nivaas.com') user = DEMO_USERS[2];
      }

      if (!user) {
        throw { response: { data: { error: 'Invalid email or password' } } };
      }

      const token = 'mock-jwt-token-' + user.id;
      const { password: _, ...userData } = user;
      localStorage.setItem('nivaas_current_user', JSON.stringify(userData));
      return { token, user: userData };
    }
  },

  async register(formData) {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      return res.data;
    } catch (err) {
      console.warn('Real backend unavailable, registering in mock engine:', err.message);
      const users = getStoredMockData('users', DEMO_USERS);
      const newUser = {
        id: users.length + 10,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        society_id: 1,
        society_name: 'Green Heights Society',
        society_code: formData.societyCode || 'GH101',
        flat_number: formData.flatNumber || 'A-101',
        is_approved: 1
      };
      users.push(newUser);
      setStoredMockData('users', users);
      const token = 'mock-jwt-token-' + newUser.id;
      const { password: _, ...userData } = newUser;
      localStorage.setItem('nivaas_current_user', JSON.stringify(userData));
      return { token, user: userData };
    }
  },

  async getMe() {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`);
      return res.data;
    } catch (err) {
      const userStr = localStorage.getItem('nivaas_current_user');
      if (userStr) {
        return { user: JSON.parse(userStr) };
      }
      return { user: DEMO_USERS[0] };
    }
  },

  async getResidents() {
    try {
      const res = await axios.get(`${API_BASE_URL}/residents`);
      return res.data;
    } catch (err) {
      const users = getStoredMockData('users', DEMO_USERS);
      return { residents: users.map(({ password, ...u }) => u) };
    }
  },

  async approveResident(residentId, isApproved) {
    try {
      const res = await axios.patch(`${API_BASE_URL}/residents/${residentId}/approve`, { isApproved });
      return res.data;
    } catch (err) {
      const users = getStoredMockData('users', DEMO_USERS);
      const user = users.find(u => u.id === residentId);
      if (user) user.is_approved = isApproved ? 1 : 0;
      setStoredMockData('users', users);
      return { message: 'Status updated' };
    }
  },

  async getComplaints() {
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints`);
      return res.data;
    } catch (err) {
      const complaints = getStoredMockData('complaints', [
        {
          id: 1,
          title: 'Water pipe leak in kitchen',
          description: 'Major leakage in flat B-402 overhead line.',
          category: 'Plumbing',
          priority: 'Urgent',
          status: 'PENDING',
          ai_summary: '[AI Auto-Summary] Category: Plumbing | Priority: Urgent',
          resident_name: 'Priya Verma',
          flat_number: 'B-402',
          created_at: new Date().toISOString()
        }
      ]);
      return { complaints };
    }
  },

  async createComplaint(payload) {
    try {
      const res = await axios.post(`${API_BASE_URL}/complaints`, payload);
      return res.data;
    } catch (err) {
      const complaints = getStoredMockData('complaints', []);
      const user = JSON.parse(localStorage.getItem('nivaas_current_user') || '{}');
      const newC = {
        id: Date.now(),
        title: payload.title,
        description: payload.description,
        category: payload.category || 'Plumbing',
        priority: payload.priority || 'Medium',
        status: 'PENDING',
        ai_summary: `[AI Auto-Summary] Category: ${payload.category || 'General'} | Priority: ${payload.priority || 'Medium'}`,
        resident_name: user.name || 'Resident',
        flat_number: user.flat_number || 'A-101',
        created_at: new Date().toISOString()
      };
      complaints.unshift(newC);
      setStoredMockData('complaints', complaints);
      return { complaint: newC };
    }
  },

  async updateComplaintStatus(id, status) {
    try {
      const res = await axios.patch(`${API_BASE_URL}/complaints/${id}/status`, { status });
      return res.data;
    } catch (err) {
      const complaints = getStoredMockData('complaints', []);
      const item = complaints.find(c => c.id === id);
      if (item) item.status = status;
      setStoredMockData('complaints', complaints);
      return { complaint: item };
    }
  },

  async getNotices() {
    try {
      const res = await axios.get(`${API_BASE_URL}/notices`);
      return res.data;
    } catch (err) {
      const notices = getStoredMockData('notices', [
        {
          id: 1,
          title: 'Scheduled Water Tank Cleaning',
          content: 'Water supply will be paused from 10 AM to 2 PM tomorrow for water tank cleaning.',
          priority: 'URGENT',
          author_name: 'Rajesh Sharma (Secretary)',
          created_at: new Date().toISOString()
        }
      ]);
      return { notices };
    }
  },

  async createNotice(payload) {
    try {
      const res = await axios.post(`${API_BASE_URL}/notices`, payload);
      return res.data;
    } catch (err) {
      const notices = getStoredMockData('notices', []);
      const user = JSON.parse(localStorage.getItem('nivaas_current_user') || '{}');
      const newN = {
        id: Date.now(),
        title: payload.title,
        content: payload.content,
        priority: payload.priority || 'NORMAL',
        author_name: user.name || 'Secretary',
        created_at: new Date().toISOString()
      };
      notices.unshift(newN);
      setStoredMockData('notices', notices);
      return { notice: newN };
    }
  },

  async deleteNotice(id) {
    try {
      const res = await axios.delete(`${API_BASE_URL}/notices/${id}`);
      return res.data;
    } catch (err) {
      let notices = getStoredMockData('notices', []);
      notices = notices.filter(n => n.id !== id);
      setStoredMockData('notices', notices);
      return { message: 'Deleted' };
    }
  },

  async getVisitors() {
    try {
      const res = await axios.get(`${API_BASE_URL}/visitors`);
      return res.data;
    } catch (err) {
      const visitors = getStoredMockData('visitors', [
        {
          id: 1,
          guest_name: 'Rahul Verma',
          phone: '9876500000',
          purpose: 'Dinner Guest',
          visitor_count: 2,
          status: 'APPROVED',
          qr_code: 'NV-PASS-A1B2',
          created_at: new Date().toISOString()
        }
      ]);
      return { visitors };
    }
  },

  async createVisitorPass(payload) {
    try {
      const res = await axios.post(`${API_BASE_URL}/visitors/create-pass`, payload);
      return res.data;
    } catch (err) {
      const visitors = getStoredMockData('visitors', []);
      const user = JSON.parse(localStorage.getItem('nivaas_current_user') || '{}');
      const qr_code = 'NV-PASS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newV = {
        id: Date.now(),
        guest_name: payload.guestName,
        phone: payload.phone || '',
        purpose: payload.purpose || 'Guest Visit',
        visitor_count: payload.visitorCount || 1,
        status: user.role === 'RESIDENT' ? 'APPROVED' : 'PENDING',
        qr_code,
        flat_number: payload.flatNumber || user.flat_number || 'B-402',
        resident_name: user.name || 'Resident',
        created_at: new Date().toISOString()
      };
      visitors.unshift(newV);
      setStoredMockData('visitors', visitors);
      return { visitor: newV };
    }
  },

  async updateVisitorStatus(id, status) {
    try {
      const res = await axios.patch(`${API_BASE_URL}/visitors/${id}/status`, { status });
      return res.data;
    } catch (err) {
      const visitors = getStoredMockData('visitors', []);
      const v = visitors.find(item => item.id === id);
      if (v) v.status = status;
      setStoredMockData('visitors', visitors);
      return { visitor: v };
    }
  },

  async verifyQrCode(qrCode) {
    try {
      const res = await axios.get(`${API_BASE_URL}/visitors/verify/${qrCode}`);
      return res.data;
    } catch (err) {
      const visitors = getStoredMockData('visitors', []);
      const v = visitors.find(item => item.qr_code === qrCode.trim());
      if (!v) {
        throw { response: { data: { error: 'Invalid or expired QR Pass Code' } } };
      }
      return { valid: true, visitor: v };
    }
  },

  async getPayments() {
    try {
      const res = await axios.get(`${API_BASE_URL}/payments`);
      return res.data;
    } catch (err) {
      const payments = getStoredMockData('payments', [
        {
          id: 1,
          title: 'July 2026 Society Maintenance',
          amount: 3500,
          due_date: '30th Jul 2026',
          status: 'PENDING',
          resident_name: 'Priya Verma',
          flat_number: 'B-402'
        }
      ]);
      return { payments };
    }
  },

  async createPaymentBill(payload) {
    try {
      const res = await axios.post(`${API_BASE_URL}/payments/create`, payload);
      return res.data;
    } catch (err) {
      const payments = getStoredMockData('payments', []);
      const newP = {
        id: Date.now(),
        title: payload.title,
        amount: payload.amount,
        due_date: payload.dueDate || '30th Jul 2026',
        status: 'PENDING',
        resident_name: 'Priya Verma',
        flat_number: payload.targetFlatNumber || 'B-402'
      };
      payments.unshift(newP);
      setStoredMockData('payments', payments);
      return { message: 'Bill created' };
    }
  },

  async payBill(id) {
    try {
      const res = await axios.post(`${API_BASE_URL}/payments/${id}/pay`);
      return res.data;
    } catch (err) {
      const payments = getStoredMockData('payments', []);
      const p = payments.find(item => item.id === id);
      if (p) {
        p.status = 'PAID';
        p.transaction_ref = 'TXN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        p.paid_at = new Date().toISOString();
      }
      setStoredMockData('payments', payments);
      return { payment: p };
    }
  },

  async getAnalytics() {
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics`);
      return res.data;
    } catch (err) {
      return {
        stats: {
          total_residents: 12,
          total_complaints: 5,
          resolved_complaints: 4,
          total_visitors: 18,
          total_revenue_collected: 35000,
          total_dues_pending: 7000
        },
        category_breakdown: [
          { category: 'Plumbing', count: 3 },
          { category: 'Electrical', count: 1 },
          { category: 'Sanitation', count: 1 }
        ],
        ai_insights: [
          "Plumbing issues represent 60% of complaints; scheduling maintenance for Wing B water riser recommended.",
          "Visitor gate entry peak hours are 5:00 PM - 8:00 PM.",
          "83% maintenance dues collected this month."
        ]
      };
    }
  }
};
