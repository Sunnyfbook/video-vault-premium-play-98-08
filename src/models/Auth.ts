
export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

const defaultAdmin: User = {
  username: 'admin',
  password: 'admin123',
  isAdmin: true
};

export const getUsers = (): User[] => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  // Initialize with default admin if nothing exists
  const users = [defaultAdmin];
  localStorage.setItem('users', JSON.stringify(users));
  return users;
};

export const authenticate = (username: string, password: string): boolean => {
  const users = getUsers();
  return users.some(user => 
    user.username === username && 
    user.password === password &&
    user.isAdmin
  );
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const login = (username: string, password: string): boolean => {
  const isValid = authenticate(username, password);
  if (isValid) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', username);
  }
  return isValid;
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('currentUser');
};
