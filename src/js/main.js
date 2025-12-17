// Main Application
import { AuthManager } from './auth.js';
import { ArtworkManager } from './artwork.js';
import { UIManager } from './ui.js';
import { CommentManager } from './comments.js';
import { ProfileManager } from './profile.js';

class ArtShareApp {
  constructor() {
    this.auth = new AuthManager();
    this.artwork = new ArtworkManager();
    this.ui = new UIManager();
    this.comments = new CommentManager();
    this.profile = new ProfileManager();

    this.currentUser = null;
    this.currentSection = 'home';

    this.initializeApp();
  }

  initializeApp() {
    // Check if user is already logged in
    this.currentUser = this.auth.getCurrentUser();

    // Initialize UI
    this.ui.init();
    this.setupEventListeners();
    this.updateAuthDisplay();

    // Load initial content
    this.loadHomeContent();

    // Clear existing sample data if you want a fresh start
    this.clearSampleData();

    // Initialize sample data if none exists
    // this.initializeSampleData(); // Commented out to remove sample artworks
  }

  initializeSampleData() {
    // Create sample users and artworks if database is empty
    if (!localStorage.getItem('artshare_users')) {
      this.createSampleData();
    }
    this.updateStats();
  }

  createSampleData() {
    // Sample users
    const sampleUsers = [
      {
        id: 'user1',
        username: 'ArtisticSoul',
        email: 'artist@example.com',
        password: 'hashedpassword',
        bio: 'Digital artist passionate about fantasy and sci-fi art',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
        joinedDate: new Date('2024-01-15').toISOString(),
        stats: { artworks: 0, likes: 0 }
      },
      {
        id: 'user2',
        username: 'PixelMaster',
        email: 'pixel@example.com',
        password: 'hashedpassword',
        bio: 'Pixel art enthusiast and game developer',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b332c2cc?w=120&h=120&fit=crop&crop=face',
        joinedDate: new Date('2024-02-20').toISOString(),
        stats: { artworks: 0, likes: 0 }
      },
      {
        id: 'user3',
        username: 'ColorVibe',
        email: 'color@example.com',
        password: 'hashedpassword',
        bio: 'Abstract artist exploring color and form',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
        joinedDate: new Date('2024-03-10').toISOString(),
        stats: { artworks: 0, likes: 0 }
      }
    ];

    // Sample artworks
    const sampleArtworks = [
      {
        id: 'art1',
        title: 'Cyberpunk Cityscape',
        description:
          'A neon-lit cityscape depicting a futuristic cyberpunk world with towering skyscrapers and flying vehicles.',
        artist: 'ArtisticSoul',
        artistId: 'user1',
        category: 'digital',
        imageUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-15T10:30:00').toISOString(),
        likes: 25,
        comments: 5,
        tags: ['cyberpunk', 'futuristic', 'cityscape']
      },
      {
        id: 'art2',
        title: 'Pixel Adventure Character',
        description: 'A charming 16-bit style character design for an indie adventure game.',
        artist: 'PixelMaster',
        artistId: 'user2',
        category: 'digital',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-14T15:45:00').toISOString(),
        likes: 18,
        comments: 3,
        tags: ['pixel', 'character', 'game']
      },
      {
        id: 'art3',
        title: 'Abstract Flow',
        description:
          'An exploration of organic shapes and vibrant colors creating a sense of movement and energy.',
        artist: 'ColorVibe',
        artistId: 'user3',
        category: 'digital',
        imageUrl:
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-13T09:20:00').toISOString(),
        likes: 32,
        comments: 8,
        tags: ['abstract', 'colorful', 'flow']
      },
      {
        id: 'art4',
        title: 'Mountain Landscape',
        description: 'A serene mountain landscape painted in traditional watercolor style.',
        artist: 'ArtisticSoul',
        artistId: 'user1',
        category: 'traditional',
        imageUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-12T14:15:00').toISOString(),
        likes: 41,
        comments: 12,
        tags: ['landscape', 'mountains', 'nature']
      },
      {
        id: 'art5',
        title: 'Character Portrait',
        description: 'A detailed character portrait showcasing lighting and anatomy studies.',
        artist: 'PixelMaster',
        artistId: 'user2',
        category: 'digital',
        imageUrl:
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-11T11:30:00').toISOString(),
        likes: 29,
        comments: 6,
        tags: ['portrait', 'character', 'study']
      },
      {
        id: 'art6',
        title: 'Geometric Harmony',
        description: 'A study in geometric patterns and color relationships.',
        artist: 'ColorVibe',
        artistId: 'user3',
        category: 'digital',
        imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
        createdAt: new Date('2024-12-10T16:00:00').toISOString(),
        likes: 22,
        comments: 4,
        tags: ['geometric', 'patterns', 'harmony']
      }
    ];

    // Sample comments
    const sampleComments = [
      {
        id: 'comment1',
        artworkId: 'art1',
        userId: 'user2',
        username: 'PixelMaster',
        text: 'Amazing atmosphere! The neon lighting really brings this to life.',
        createdAt: new Date('2024-12-15T11:15:00').toISOString()
      },
      {
        id: 'comment2',
        artworkId: 'art1',
        userId: 'user3',
        username: 'ColorVibe',
        text: 'Love the color palette choice here. Very moody and cyberpunk!',
        createdAt: new Date('2024-12-15T12:00:00').toISOString()
      },
      {
        id: 'comment3',
        artworkId: 'art2',
        userId: 'user1',
        username: 'ArtisticSoul',
        text: 'Such clean pixel work! Reminds me of classic 90s adventure games.',
        createdAt: new Date('2024-12-14T16:30:00').toISOString()
      },
      {
        id: 'comment4',
        artworkId: 'art3',
        userId: 'user1',
        username: 'ArtisticSoul',
        text: 'The flow and movement in this piece is incredible. Great work!',
        createdAt: new Date('2024-12-13T10:45:00').toISOString()
      }
    ];

    // Store sample data
    localStorage.setItem('artshare_users', JSON.stringify(sampleUsers));
    localStorage.setItem('artshare_artworks', JSON.stringify(sampleArtworks));
    localStorage.setItem('artshare_comments', JSON.stringify(sampleComments));
    localStorage.setItem('artshare_user_likes', JSON.stringify({}));

    console.log('Sample data initialized');
  }

  clearSampleData() {
    // Remove all sample data from localStorage
    localStorage.removeItem('artshare_artworks');
    localStorage.removeItem('artshare_comments');
    localStorage.removeItem('artshare_user_likes');
    localStorage.removeItem('artshare_users');
    console.log('Sample data cleared');
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateToSection(section);
      });
    });

    // Dropdown menu navigation
    document.querySelectorAll('.dropdown-menu a[data-section]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateToSection(section);
      });
    });

    // Authentication buttons
    document
      .getElementById('login-btn')
      ?.addEventListener('click', () => this.ui.showModal('login-modal'));
    document
      .getElementById('register-btn')
      ?.addEventListener('click', () => this.ui.showModal('register-modal'));
    document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

    // Modal switches
    document.getElementById('switch-to-register')?.addEventListener('click', e => {
      e.preventDefault();
      this.ui.hideModal('login-modal');
      this.ui.showModal('register-modal');
    });

    document.getElementById('switch-to-login')?.addEventListener('click', e => {
      e.preventDefault();
      this.ui.hideModal('register-modal');
      this.ui.showModal('login-modal');
    });

    // Form submissions
    document.getElementById('login-form')?.addEventListener('submit', e => this.handleLogin(e));
    document
      .getElementById('register-form')
      ?.addEventListener('submit', e => this.handleRegister(e));
    document
      .getElementById('post-art-form')
      ?.addEventListener('submit', e => this.handlePostArt(e));

    // Post art button
    document.getElementById('post-art-btn')?.addEventListener('click', () => {
      if (this.currentUser) {
        this.ui.showModal('post-art-modal');
      } else {
        this.ui.showToast('Please log in to post artwork', 'warning');
        this.ui.showModal('login-modal');
      }
    });

    // File upload preview
    document
      .getElementById('art-image')
      ?.addEventListener('change', e => this.handleImagePreview(e));

    // Setup drag and drop for file upload
    this.setupFileUploadDropZone();

    // Filter and search
    document
      .getElementById('sort-filter')
      ?.addEventListener('change', () => this.loadHomeContent());
    document
      .getElementById('category-filter')
      ?.addEventListener('change', () => this.loadGalleryContent());
    document
      .getElementById('gallery-search')
      ?.addEventListener('input', () => this.loadGalleryContent());

    // Profile tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleTabSwitch(btn));
    });

    // Mobile menu toggle
    document
      .getElementById('mobile-toggle')
      ?.addEventListener('click', () => this.ui.toggleMobileMenu());

    // Close modals when clicking outside
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal')) {
        this.ui.hideAllModals();
      }
    });

    // Close modals with close button
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.ui.hideAllModals());
    });
  }

  // Authentication handlers
  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
      const user = await this.auth.login(username, password);
      this.currentUser = user;
      this.updateAuthDisplay();
      this.ui.hideModal('login-modal');
      this.ui.showToast(`Welcome back, ${user.username}!`, 'success');

      // Refresh content
      this.loadHomeContent();
    } catch (error) {
      this.ui.showToast(error.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (password !== confirmPassword) {
      this.ui.showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const user = await this.auth.register(username, email, password);
      this.currentUser = user;
      this.updateAuthDisplay();
      this.ui.hideModal('register-modal');
      this.ui.showToast(`Welcome to ArtShare, ${user.username}!`, 'success');
      this.updateStats();

      // Refresh content
      this.loadHomeContent();
    } catch (error) {
      this.ui.showToast(error.message, 'error');
    }
  }

  handleLogout() {
    this.auth.logout();
    this.currentUser = null;
    this.updateAuthDisplay();
    this.navigateToSection('home');
    this.ui.showToast('Logged out successfully', 'success');
  }

  async handlePostArt(e) {
    e.preventDefault();
    if (!this.currentUser) return;

    const title = document.getElementById('art-title').value;
    const description = document.getElementById('art-description').value;
    const category = document.getElementById('art-category').value;
    const imageFile = document.getElementById('art-image').files[0];

    if (!imageFile) {
      this.ui.showToast('Please select an image', 'error');
      return;
    }

    try {
      // Validate the image file
      this.ui.validateImageFile(imageFile);
      
      const imageUrl = await this.ui.fileToBase64(imageFile);

      await this.artwork.createArtwork({
        title,
        description,
        category,
        imageUrl,
        artist: this.currentUser.username,
        artistId: this.currentUser.id
      });

      this.ui.hideModal('post-art-modal');
      this.ui.showToast('Artwork posted successfully!', 'success');

      // Reset form
      document.getElementById('post-art-form').reset();
      document.getElementById('image-preview').style.display = 'none';

      // Refresh content
      this.loadHomeContent();
      this.updateStats();
    } catch (error) {
      this.ui.showToast(`Error posting artwork: ${error.message}`, 'error');
    }
  }

  handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        this.ui.validateImageFile(file);
        const reader = new FileReader();
        reader.onload = e => {
          const preview = document.getElementById('image-preview');
          const previewImg = document.getElementById('preview-image');
          previewImg.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } catch (error) {
        this.ui.showToast(error.message, 'error');
        // Clear the input
        e.target.value = '';
      }
    }
  }

  setupFileUploadDropZone() {
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.getElementById('art-image');
    
    if (!fileUpload || !fileInput) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileUpload.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      fileUpload.addEventListener(eventName, () => {
        fileUpload.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileUpload.addEventListener(eventName, () => {
        fileUpload.classList.remove('dragover');
      }, false);
    });

    // Handle dropped files
    fileUpload.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 0) {
        fileInput.files = files;
        this.handleImagePreview({ target: fileInput });
      }
    }, false);

    // Click to upload
    fileUpload.addEventListener('click', () => {
      fileInput.click();
    });
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Navigation
  navigateToSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === section) {
        link.classList.add('active');
      }
    });

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = section;
    }

    // Load section content
    switch (section) {
      case 'home':
        this.loadHomeContent();
        break;
      case 'gallery':
        this.loadGalleryContent();
        break;
      case 'profile':
        if (this.currentUser) {
          this.loadProfileContent();
        } else {
          this.ui.showToast('Please log in to view your profile', 'warning');
          this.ui.showModal('login-modal');
        }
        break;
      case 'my-art':
        if (this.currentUser) {
          this.navigateToSection('profile');
        } else {
          this.ui.showToast('Please log in to view your art', 'warning');
          this.ui.showModal('login-modal');
        }
        break;
    }
  }

  // Content loading
  loadHomeContent() {
    const sortBy = document.getElementById('sort-filter')?.value || 'newest';
    const artworks = this.artwork.getAllArtworks(sortBy);
    this.renderArtworkGrid(artworks, 'main-feed');
  }

  loadGalleryContent() {
    const category = document.getElementById('category-filter')?.value || 'all';
    const search = document.getElementById('gallery-search')?.value || '';
    const artworks = this.artwork.getFilteredArtworks(category, search);
    this.renderArtworkGrid(artworks, 'gallery-grid');
  }

  loadProfileContent() {
    if (!this.currentUser) return;

    this.profile.updateProfileDisplay(this.currentUser);

    // Load user's artworks
    const userArtworks = this.artwork.getArtworksByUser(this.currentUser.id);
    this.renderArtworkGrid(userArtworks, 'profile-artworks');

    // Load liked artworks
    const likedArtworks = this.artwork.getLikedArtworks(this.currentUser.id);
    this.renderArtworkGrid(likedArtworks, 'liked-artworks');
  }

  // UI Updates
  updateAuthDisplay() {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');

    if (this.currentUser) {
      authSection.style.display = 'none';
      userSection.style.display = 'block';

      // Update user display
      const usernameDisplay = document.getElementById('username-display');
      const userAvatar = document.getElementById('user-avatar');

      if (usernameDisplay) usernameDisplay.textContent = this.currentUser.username;
      if (userAvatar) userAvatar.src = this.currentUser.avatar || 'https://via.placeholder.com/40';
    } else {
      authSection.style.display = 'block';
      userSection.style.display = 'none';
    }
  }

  updateStats() {
    const artworks = this.artwork.getAllArtworks();
    const users = this.auth.getAllUsers();

    const totalArtworksEl = document.getElementById('total-artworks');
    const totalArtistsEl = document.getElementById('total-artists');

    if (totalArtworksEl) totalArtworksEl.textContent = artworks.length;
    if (totalArtistsEl) totalArtistsEl.textContent = users.length;
  }

  renderArtworkGrid(artworks, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (artworks.length === 0) {
      container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No artworks found</p>
                </div>
            `;
      return;
    }

    container.innerHTML = artworks
      .map(
        artwork => `
            <div class="artwork-card" data-artwork-id="${artwork.id}">
                <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image">
                <div class="artwork-info">
                    <h4 class="artwork-title">${artwork.title}</h4>
                    <div class="artwork-meta">
                        <span class="artist">By ${artwork.artist}</span>
                        <span class="date">${this.ui.formatDate(artwork.createdAt)}</span>
                    </div>
                    <p class="artwork-description">${artwork.description}</p>
                    <div class="artwork-actions">
                        <button class="like-btn ${this.artwork.isLikedByUser(artwork.id, this.currentUser?.id) ? 'liked' : ''}" 
                                data-artwork-id="${artwork.id}">
                            <i class="fas fa-heart"></i>
                            <span>${artwork.likes}</span>
                        </button>
                        <span class="comments-count">
                            <i class="fas fa-comment"></i>
                            ${artwork.comments}
                        </span>
                        <span class="category-tag">${artwork.category}</span>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    // Add event listeners
    container.querySelectorAll('.artwork-card').forEach(card => {
      card.addEventListener('click', e => {
        if (!e.target.closest('.like-btn')) {
          const artworkId = card.dataset.artworkId;
          this.showArtworkModal(artworkId);
        }
      });
    });

    container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const artworkId = btn.dataset.artworkId;
        this.handleLike(artworkId);
      });
    });
  }

  async showArtworkModal(artworkId) {
    const artwork = this.artwork.getArtworkById(artworkId);
    if (!artwork) return;

    // Update modal content
    document.getElementById('modal-artwork-image').src = artwork.imageUrl;
    document.getElementById('modal-artwork-title').textContent = artwork.title;
    document.getElementById('modal-artwork-artist').textContent = artwork.artist;
    document.getElementById('modal-artwork-date').textContent = this.ui.formatDate(
      artwork.createdAt
    );
    document.getElementById('modal-artwork-category').textContent = artwork.category;
    document.getElementById('modal-artwork-description').textContent = artwork.description;
    document.getElementById('modal-like-count').textContent = artwork.likes;

    // Update like button
    const likeBtn = document.getElementById('modal-like-btn');
    likeBtn.className = `btn-icon like-btn ${this.artwork.isLikedByUser(artworkId, this.currentUser?.id) ? 'liked' : ''}`;
    likeBtn.onclick = () => this.handleLike(artworkId, true);

    // Show delete button if user owns the artwork
    const deleteBtn = document.getElementById('modal-delete-btn');
    if (this.currentUser && artwork.artistId === this.currentUser.id) {
      deleteBtn.style.display = 'block';
      deleteBtn.onclick = () => this.handleDeleteArtwork(artworkId);
    } else {
      deleteBtn.style.display = 'none';
    }

    // Load comments
    this.comments.loadCommentsForModal(artworkId);

    // Setup comment form
    const commentFormSection = document.getElementById('comment-form-section');
    if (this.currentUser) {
      commentFormSection.style.display = 'block';
      document.getElementById('post-comment-btn').onclick = () => this.handlePostComment(artworkId);
    } else {
      commentFormSection.style.display = 'none';
    }

    this.ui.showModal('artwork-modal');
  }

  handleLike(artworkId, updateModal = false) {
    if (!this.currentUser) {
      this.ui.showToast('Please log in to like artworks', 'warning');
      this.ui.showModal('login-modal');
      return;
    }

    const success = this.artwork.toggleLike(artworkId, this.currentUser.id);
    if (success) {
      // Refresh the current view
      if (this.currentSection === 'home') {
        this.loadHomeContent();
      } else if (this.currentSection === 'gallery') {
        this.loadGalleryContent();
      } else if (this.currentSection === 'profile') {
        this.loadProfileContent();
      }

      // Update modal if open
      if (updateModal) {
        const updatedArtwork = this.artwork.getArtworkById(artworkId);
        document.getElementById('modal-like-count').textContent = updatedArtwork.likes;
        const likeBtn = document.getElementById('modal-like-btn');
        likeBtn.className = `btn-icon like-btn ${this.artwork.isLikedByUser(artworkId, this.currentUser.id) ? 'liked' : ''}`;
      }
    }
  }

  handleDeleteArtwork(artworkId) {
    if (confirm('Are you sure you want to delete this artwork?')) {
      const success = this.artwork.deleteArtwork(artworkId, this.currentUser.id);
      if (success) {
        this.ui.hideModal('artwork-modal');
        this.ui.showToast('Artwork deleted successfully', 'success');

        // Refresh current view
        if (this.currentSection === 'home') {
          this.loadHomeContent();
        } else if (this.currentSection === 'gallery') {
          this.loadGalleryContent();
        } else if (this.currentSection === 'profile') {
          this.loadProfileContent();
        }

        this.updateStats();
      } else {
        this.ui.showToast('Error deleting artwork', 'error');
      }
    }
  }

  handlePostComment(artworkId) {
    const commentText = document.getElementById('comment-text').value.trim();
    if (!commentText) return;

    const success = this.comments.addComment(
      artworkId,
      this.currentUser.id,
      this.currentUser.username,
      commentText
    );
    if (success) {
      document.getElementById('comment-text').value = '';
      this.comments.loadCommentsForModal(artworkId);

      // Update comment count in artwork
      this.artwork.incrementCommentCount(artworkId);

      // Refresh current view to update comment counts
      if (this.currentSection === 'home') {
        this.loadHomeContent();
      } else if (this.currentSection === 'gallery') {
        this.loadGalleryContent();
      }
    }
  }

  handleTabSwitch(btn) {
    const tabName = btn.dataset.tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.artShareApp = new ArtShareApp();
});

export { ArtShareApp };
