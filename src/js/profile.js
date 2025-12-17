// Profile Manager
export class ProfileManager {
  constructor() {
    this.currentProfileId = null;
  }

  updateProfileDisplay(user) {
    if (!user) return;

    // Update profile header
    const profileAvatar = document.getElementById('profile-avatar');
    const profileUsername = document.getElementById('profile-username');
    const profileBio = document.getElementById('profile-bio');
    const profileArtworksCount = document.getElementById('profile-artworks-count');
    const profileLikesCount = document.getElementById('profile-likes-count');
    const profileJoined = document.getElementById('profile-joined');

    if (profileAvatar) profileAvatar.src = user.avatar || 'https://via.placeholder.com/120';
    if (profileUsername) profileUsername.textContent = user.username;
    if (profileBio) profileBio.textContent = user.bio || 'No bio provided yet.';

    // Update stats
    const userArtworks = window.artShareApp.artwork.getArtworksByUser(user.id);
    const totalLikes = userArtworks.reduce((sum, artwork) => sum + artwork.likes, 0);
    const joinedYear = new Date(user.joinedDate).getFullYear();

    if (profileArtworksCount) profileArtworksCount.textContent = userArtworks.length;
    if (profileLikesCount) profileLikesCount.textContent = totalLikes;
    if (profileJoined) profileJoined.textContent = joinedYear;

    this.currentProfileId = user.id;
    this.setupProfileEventListeners();
  }

  setupProfileEventListeners() {
    const currentUser = window.artShareApp?.currentUser;
    const editProfileBtn = document.getElementById('edit-profile-btn');

    // Only show edit button for own profile
    if (editProfileBtn) {
      if (currentUser && this.currentProfileId === currentUser.id) {
        editProfileBtn.style.display = 'block';
        editProfileBtn.onclick = () => this.showEditProfileModal();
      } else {
        editProfileBtn.style.display = 'none';
      }
    }

    // Setup edit profile form
    this.setupEditProfileForm();
  }

  showEditProfileModal() {
    const currentUser = window.artShareApp?.currentUser;
    if (!currentUser) return;

    // Pre-fill form with current user data
    const editBio = document.getElementById('edit-bio');
    if (editBio) editBio.value = currentUser.bio || '';

    window.artShareApp.ui.showModal('edit-profile-modal');
  }

  setupEditProfileForm() {
    const editProfileForm = document.getElementById('edit-profile-form');
    const editAvatarInput = document.getElementById('edit-avatar');

    if (editProfileForm) {
      editProfileForm.onsubmit = e => this.handleEditProfile(e);
    }

    // Handle avatar preview
    if (editAvatarInput) {
      editAvatarInput.onchange = e => this.handleAvatarPreview(e);
    }
  }

  async handleEditProfile(e) {
    e.preventDefault();
    const currentUser = window.artShareApp?.currentUser;
    if (!currentUser) return;

    const bio = document.getElementById('edit-bio').value;
    const avatarFile = document.getElementById('edit-avatar').files[0];

    try {
      const updates = { bio };

      // Handle avatar upload if provided
      if (avatarFile) {
        window.artShareApp.ui.validateImageFile(avatarFile);
        updates.avatar = await window.artShareApp.ui.fileToBase64(avatarFile);
      }

      // Update user profile
      const success = window.artShareApp.auth.updateUser(currentUser.id, updates);

      if (success) {
        // Update current user object
        Object.assign(currentUser, updates);

        // Refresh profile display
        this.updateProfileDisplay(currentUser);

        // Update nav avatar
        const navAvatar = document.getElementById('user-avatar');
        if (navAvatar && updates.avatar) {
          navAvatar.src = updates.avatar;
        }

        window.artShareApp.ui.hideModal('edit-profile-modal');
        window.artShareApp.ui.showToast('Profile updated successfully!', 'success');

        // Clear form
        document.getElementById('edit-profile-form').reset();
      } else {
        window.artShareApp.ui.showToast('Error updating profile', 'error');
      }
    } catch (error) {
      window.artShareApp.ui.showToast(`Error: ${error.message}`, 'error');
    }
  }

  handleAvatarPreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      window.artShareApp.ui.validateImageFile(file);

      const reader = new FileReader();
      reader.onload = e => {
        // Create preview if it doesn't exist
        let preview = document.querySelector('.avatar-preview');
        if (!preview) {
          preview = document.createElement('div');
          preview.className = 'avatar-preview';
          preview.innerHTML =
            '<img style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">';
          e.target.parentNode.appendChild(preview);
        }

        const previewImg = preview.querySelector('img');
        previewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      window.artShareApp.ui.showToast(error.message, 'error');
      e.target.value = ''; // Clear invalid file
    }
  }

  loadUserProfile(userId) {
    const user = window.artShareApp.auth.getUserById(userId);
    if (!user) return false;

    this.updateProfileDisplay(user);

    // Load user's artworks
    const userArtworks = window.artShareApp.artwork.getArtworksByUser(userId);
    window.artShareApp.renderArtworkGrid(userArtworks, 'profile-artworks');

    return true;
  }

  getProfileStats(userId) {
    const user = window.artShareApp.auth.getUserById(userId);
    const userArtworks = window.artShareApp.artwork.getArtworksByUser(userId);

    if (!user) return null;

    const totalLikes = userArtworks.reduce((sum, artwork) => sum + artwork.likes, 0);
    const totalComments = userArtworks.reduce((sum, artwork) => sum + artwork.comments, 0);
    const totalViews = userArtworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0);

    const categoryStats = {};
    userArtworks.forEach(artwork => {
      categoryStats[artwork.category] = (categoryStats[artwork.category] || 0) + 1;
    });

    const mostPopularArtwork =
      userArtworks.length > 0
        ? userArtworks.reduce((prev, current) =>
            prev.likes + prev.comments > current.likes + current.comments ? prev : current
          )
        : null;

    return {
      user,
      artworkCount: userArtworks.length,
      totalLikes,
      totalComments,
      totalViews,
      categoryStats,
      mostPopularArtwork,
      averageLikesPerArtwork:
        userArtworks.length > 0 ? (totalLikes / userArtworks.length).toFixed(1) : 0,
      joinedDaysAgo: Math.floor((Date.now() - new Date(user.joinedDate)) / (1000 * 60 * 60 * 24))
    };
  }

  renderProfileCard(userId, containerId) {
    const stats = this.getProfileStats(userId);
    if (!stats) return false;

    const container = document.getElementById(containerId);
    if (!container) return false;

    const { user, artworkCount, totalLikes, categoryStats, mostPopularArtwork } = stats;
    const topCategory = Object.keys(categoryStats).reduce(
      (a, b) => (categoryStats[a] > categoryStats[b] ? a : b),
      'none'
    );

    container.innerHTML = `
            <div class="profile-card">
                <div class="profile-card-header">
                    <img src="${user.avatar}" alt="${user.username}" class="profile-card-avatar">
                    <div class="profile-card-info">
                        <h3 class="profile-card-username">${user.username}</h3>
                        <p class="profile-card-bio">${user.bio || 'No bio provided.'}</p>
                    </div>
                </div>
                <div class="profile-card-stats">
                    <div class="stat">
                        <span class="stat-number">${artworkCount}</span>
                        <span class="stat-label">Artworks</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${totalLikes}</span>
                        <span class="stat-label">Likes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${topCategory}</span>
                        <span class="stat-label">Top Category</span>
                    </div>
                </div>
                ${
                  mostPopularArtwork
                    ? `
                    <div class="profile-card-featured">
                        <h4>Most Popular</h4>
                        <div class="featured-artwork" data-artwork-id="${mostPopularArtwork.id}">
                            <img src="${mostPopularArtwork.imageUrl}" alt="${mostPopularArtwork.title}">
                            <div class="featured-info">
                                <span class="featured-title">${mostPopularArtwork.title}</span>
                                <span class="featured-likes">${mostPopularArtwork.likes} likes</span>
                            </div>
                        </div>
                    </div>
                `
                    : ''
                }
                <button class="btn btn-outline view-profile-btn" data-user-id="${userId}">
                    View Full Profile
                </button>
            </div>
        `;

    // Add event listeners
    const viewProfileBtn = container.querySelector('.view-profile-btn');
    if (viewProfileBtn) {
      viewProfileBtn.onclick = () => {
        if (window.artShareApp.currentUser && userId === window.artShareApp.currentUser.id) {
          window.artShareApp.navigateToSection('profile');
        } else {
          // For now, just show a toast. In a full app, this would navigate to the user's public profile
          window.artShareApp.ui.showToast('Public profiles coming soon!', 'info');
        }
      };
    }

    const featuredArtwork = container.querySelector('.featured-artwork');
    if (featuredArtwork) {
      featuredArtwork.onclick = () => {
        const artworkId = featuredArtwork.dataset.artworkId;
        window.artShareApp.showArtworkModal(artworkId);
      };
    }

    return true;
  }

  generateProfileSummary(userId) {
    const stats = this.getProfileStats(userId);
    if (!stats) return null;

    const { user, artworkCount, totalLikes, joinedDaysAgo, categoryStats } = stats;

    let summary = `${user.username} has been creating art for ${joinedDaysAgo} days`;

    if (artworkCount > 0) {
      summary += ` and has shared ${artworkCount} artwork${artworkCount > 1 ? 's' : ''}`;

      if (totalLikes > 0) {
        summary += ` receiving ${totalLikes} like${totalLikes > 1 ? 's' : ''}`;
      }

      const topCategories = Object.keys(categoryStats)
        .sort((a, b) => categoryStats[b] - categoryStats[a])
        .slice(0, 2);

      if (topCategories.length > 0) {
        summary += `. They primarily create ${topCategories.join(' and ')} art.`;
      }
    } else {
      summary += " but hasn't shared any artworks yet.";
    }

    return summary;
  }

  // Achievement system (for gamification)
  checkAchievements(userId) {
    const stats = this.getProfileStats(userId);
    if (!stats) return [];

    const achievements = [];
    const { artworkCount, totalLikes, totalViews, joinedDaysAgo } = stats;

    // Artwork milestones
    if (artworkCount >= 1)
      achievements.push({
        type: 'first_artwork',
        title: 'First Creation',
        description: 'Posted your first artwork!'
      });
    if (artworkCount >= 5)
      achievements.push({
        type: 'active_artist',
        title: 'Active Artist',
        description: 'Posted 5 artworks'
      });
    if (artworkCount >= 10)
      achievements.push({
        type: 'prolific_creator',
        title: 'Prolific Creator',
        description: 'Posted 10 artworks'
      });
    if (artworkCount >= 25)
      achievements.push({
        type: 'art_machine',
        title: 'Art Machine',
        description: 'Posted 25 artworks'
      });

    // Like milestones
    if (totalLikes >= 10)
      achievements.push({
        type: 'liked_artist',
        title: 'Liked Artist',
        description: 'Received 10 likes'
      });
    if (totalLikes >= 50)
      achievements.push({
        type: 'popular_artist',
        title: 'Popular Artist',
        description: 'Received 50 likes'
      });
    if (totalLikes >= 100)
      achievements.push({
        type: 'beloved_artist',
        title: 'Beloved Artist',
        description: 'Received 100 likes'
      });

    // Time-based achievements
    if (joinedDaysAgo >= 30)
      achievements.push({ type: 'veteran', title: 'Veteran', description: 'Member for 30 days' });
    if (joinedDaysAgo >= 365)
      achievements.push({
        type: 'annual_member',
        title: 'Annual Member',
        description: 'Member for 1 year'
      });

    // View achievements
    if (totalViews >= 100)
      achievements.push({
        type: 'viewed_artist',
        title: 'Viewed Artist',
        description: 'Artworks viewed 100 times'
      });
    if (totalViews >= 1000)
      achievements.push({
        type: 'viral_artist',
        title: 'Viral Artist',
        description: 'Artworks viewed 1000 times'
      });

    return achievements;
  }

  displayAchievements(userId, containerId) {
    const achievements = this.checkAchievements(userId);
    const container = document.getElementById(containerId);

    if (!container) return false;

    if (achievements.length === 0) {
      container.innerHTML = '<p class="no-achievements">No achievements yet. Keep creating!</p>';
      return true;
    }

    container.innerHTML = `
            <div class="achievements-grid">
                ${achievements
                  .map(
                    achievement => `
                    <div class="achievement-badge">
                        <div class="achievement-icon">🏆</div>
                        <div class="achievement-info">
                            <h4 class="achievement-title">${achievement.title}</h4>
                            <p class="achievement-description">${achievement.description}</p>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;

    return true;
  }

  // Follow/Following system (for future implementation)
  followUser(_followerId, _followingId) {
    // This would be implemented with a proper backend
    // For now, just show a placeholder
    window.artShareApp.ui.showToast('Follow feature coming soon!', 'info');
  }

  unfollowUser(_followerId, _followingId) {
    // This would be implemented with a proper backend
    // For now, just show a placeholder
    window.artShareApp.ui.showToast('Unfollow feature coming soon!', 'info');
  }

  // Profile validation
  validateProfileData(data) {
    const errors = [];

    if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    if (data.username) {
      if (data.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (data.username.length > 20) {
        errors.push('Username must be less than 20 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }

    return errors;
  }

  // Export profile data
  exportProfileData(userId) {
    const user = window.artShareApp.auth.getUserById(userId);
    const userArtworks = window.artShareApp.artwork.getArtworksByUser(userId);
    const stats = this.getProfileStats(userId);

    return {
      user,
      artworks: userArtworks,
      stats,
      achievements: this.checkAchievements(userId),
      exportDate: new Date().toISOString()
    };
  }
}
