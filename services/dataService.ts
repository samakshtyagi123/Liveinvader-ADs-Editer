import { User, UserRole, AccessRequest, UsageLog } from '../types';

const USERS_KEY = 'li_ai_users';
const REQUESTS_KEY = 'li_ai_requests';
const LOGS_KEY = 'li_ai_logs';

// Initialize Owner if not exists
const initOwner = () => {
  const users = getUsers();
  if (!users.find(u => u.username === 'Samaksh_Adachi')) {
    const owner: User = {
      id: 'owner-001',
      username: 'Samaksh_Adachi',
      role: 'OWNER',
      status: 'APPROVED',
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      totalTimeSpent: 0
    };
    saveUser(owner);
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getRequests = (): AccessRequest[] => {
  const data = localStorage.getItem(REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const createRequest = (user: User) => {
  const requests = getRequests();
  const newReq: AccessRequest = {
    id: Date.now().toString(),
    userId: user.id,
    username: user.username,
    timestamp: Date.now(),
    status: 'PENDING'
  };
  requests.push(newReq);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const updateRequestStatus = (reqId: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) => {
  const requests = getRequests();
  const req = requests.find(r => r.id === reqId);
  if (req) {
    req.status = status;
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    
    // Update User Status
    const users = getUsers();
    const user = users.find(u => u.id === req.userId);
    if (user) {
      user.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }
};

export const updateUserRole = (userId: string, newRole: UserRole) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const updateUserStatus = (userId: string, newStatus: User['status']) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = newStatus;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

export const logUsage = (userId: string, username: string, action: 'LOGIN' | 'LOGOUT') => {
  const logs = getLogs();
  const newLog: UsageLog = {
    id: Date.now().toString(),
    userId,
    username,
    action,
    timestamp: Date.now()
  };
  logs.push(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getLogs = (): UsageLog[] => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
};

export const updateTotalTime = (userId: string, seconds: number) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.totalTimeSpent += seconds;
        user.lastActiveAt = Date.now();
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

// Initial setup
initOwner();