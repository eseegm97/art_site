// Authentication Manager
export class AuthManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = localStorage.getItem('artshare_current_user');
  }

  loadUsers() {
    const users = localStorage.getItem('artshare_users');
    return users ? JSON.parse(users) : [];
  }

  saveUsers() {
    localStorage.setItem('artshare_users', JSON.stringify(this.users));
  }

  async register(username, email, password) {
    // Validate input
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if username already exists
    if (this.users.find(user => user.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (this.users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = {
      id: this.generateUserId(),
      username,
      email,
      password: this.hashPassword(password), // In real app, use proper hashing
      bio: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff&size=120`,
      joinedDate: new Date().toISOString(),
      stats: {
        artworks: 0,
        likes: 0
      }
    };

    this.users.push(user);
    this.saveUsers();

    // Auto-login after registration
    this.currentUserId = user.id;
    localStorage.setItem('artshare_current_user', user.id);

    return this.sanitizeUser(user);
  }

  async login(username, password) {
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid username or password');
    }

    this.currentUserId = user.id;
    localStorage.setItem('artshare_current_user', user.id);

    return this.sanitizeUser(user);
  }

  logout() {
    this.currentUserId = null;
    localStorage.removeItem('artshare_current_user');
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;

    const user = this.users.find(u => u.id === this.currentUserId);
    return user ? this.sanitizeUser(user) : null;
  }

  getUserById(userId) {
    const user = this.users.find(u => u.id === userId);
    return user ? this.sanitizeUser(user) : null;
  }

  getAllUsers() {
    return this.users.map(user => this.sanitizeUser(user));
  }

  updateUser(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    // Only allow certain fields to be updated
    const allowedFields = ['bio', 'avatar', 'stats'];
    const filteredUpdates = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    this.users[userIndex] = { ...this.users[userIndex], ...filteredUpdates };
    this.saveUsers();

    return true;
  }

  incrementUserStats(userId, statType) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    if (!user.stats[statType]) {
      user.stats[statType] = 0;
    }

    user.stats[statType]++;
    this.saveUsers();

    return true;
  }

  decrementUserStats(userId, statType) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    if (user.stats[statType] && user.stats[statType] > 0) {
      user.stats[statType]--;
      this.saveUsers();
    }

    return true;
  }

  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashPassword(password) {
    // Simple hash for demo purposes - in production use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  sanitizeUser(user) {
    // Remove password from user object
    // eslint-disable-next-line no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  validateUsername(username) {
    const errors = [];

    if (!username) {
      errors.push('Username is required');
    } else {
      if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (username.length > 20) {
        errors.push('Username must be less than 20 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
      if (this.users.find(user => user.username.toLowerCase() === username.toLowerCase())) {
        errors.push('Username already exists');
      }
    }

    return errors;
  }

  validateEmail(email) {
    const errors = [];

    if (!email) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }
      if (this.users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
        errors.push('Email already registered');
      }
    }

    return errors;
  }

  validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (password.length > 50) {
        errors.push('Password must be less than 50 characters');
      }
    }

    return errors;
  }

  // For development/testing purposes
  clearAllUsers() {
    this.users = [];
    this.saveUsers();
    this.logout();
  }

  // Get user statistics
  getUserStats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(user => {
        // Consider user active if joined in last 30 days
        const joinDate = new Date(user.joinedDate);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return joinDate > thirtyDaysAgo;
      }).length,
      topArtists: this.users
        .sort((a, b) => (b.stats?.artworks || 0) - (a.stats?.artworks || 0))
        .slice(0, 5)
        .map(user => this.sanitizeUser(user))
    };
  }
}
