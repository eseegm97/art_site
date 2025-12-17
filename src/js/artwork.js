// Artwork Manager
export class ArtworkManager {
  constructor() {
    this.artworks = this.loadArtworks();
    this.userLikes = this.loadUserLikes();
  }

  loadArtworks() {
    const artworks = localStorage.getItem('artshare_artworks');
    return artworks ? JSON.parse(artworks) : [];
  }

  saveArtworks() {
    localStorage.setItem('artshare_artworks', JSON.stringify(this.artworks));
  }

  loadUserLikes() {
    const likes = localStorage.getItem('artshare_user_likes');
    return likes ? JSON.parse(likes) : {};
  }

  saveUserLikes() {
    localStorage.setItem('artshare_user_likes', JSON.stringify(this.userLikes));
  }

  async createArtwork(artworkData) {
    const { title, description, category, imageUrl, artist, artistId } = artworkData;

    // Validate input
    if (!title || !imageUrl || !artist || !artistId) {
      throw new Error('Required fields missing');
    }

    if (title.length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (title.length > 100) {
      throw new Error('Title must be less than 100 characters');
    }

    if (description && description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }

    const artwork = {
      id: this.generateArtworkId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      artist,
      artistId,
      category: category || 'other',
      imageUrl,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      tags: this.extractTags(`${title} ${description}`),
      views: 0
    };

    this.artworks.unshift(artwork); // Add to beginning for chronological order
    this.saveArtworks();

    // Update user stats
    if (window.artShareApp?.auth) {
      window.artShareApp.auth.incrementUserStats(artistId, 'artworks');
    }

    return artwork;
  }

  getAllArtworks(sortBy = 'newest') {
    const sortedArtworks = [...this.artworks];

    switch (sortBy) {
      case 'oldest':
        sortedArtworks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        sortedArtworks.sort((a, b) => b.likes + b.comments * 2 - (a.likes + a.comments * 2));
        break;
      case 'newest':
      default:
        sortedArtworks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return sortedArtworks;
  }

  getArtworkById(artworkId) {
    const artwork = this.artworks.find(a => a.id === artworkId);
    if (artwork) {
      // Increment view count
      artwork.views = (artwork.views || 0) + 1;
      this.saveArtworks();
    }
    return artwork;
  }

  getArtworksByUser(userId) {
    return this.artworks
      .filter(artwork => artwork.artistId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getFilteredArtworks(category = 'all', searchTerm = '') {
    let filtered = this.artworks;

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(artwork => artwork.category === category);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        artwork =>
          artwork.title.toLowerCase().includes(term) ||
          artwork.description.toLowerCase().includes(term) ||
          artwork.artist.toLowerCase().includes(term) ||
          artwork.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort by newest first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getLikedArtworks(userId) {
    const userLikedIds = Object.keys(this.userLikes).filter(artworkId =>
      this.userLikes[artworkId].includes(userId)
    );

    return this.artworks
      .filter(artwork => userLikedIds.includes(artwork.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  toggleLike(artworkId, userId) {
    if (!userId) return false;

    const artwork = this.artworks.find(a => a.id === artworkId);
    if (!artwork) return false;

    // Initialize user likes for this artwork if not exists
    if (!this.userLikes[artworkId]) {
      this.userLikes[artworkId] = [];
    }

    const userLikedIndex = this.userLikes[artworkId].indexOf(userId);

    if (userLikedIndex > -1) {
      // User already liked, remove like
      this.userLikes[artworkId].splice(userLikedIndex, 1);
      artwork.likes = Math.max(0, artwork.likes - 1);

      // Update artist stats
      if (window.artShareApp?.auth) {
        window.artShareApp.auth.decrementUserStats(artwork.artistId, 'likes');
      }
    } else {
      // User hasn't liked, add like
      this.userLikes[artworkId].push(userId);
      artwork.likes++;

      // Update artist stats
      if (window.artShareApp?.auth) {
        window.artShareApp.auth.incrementUserStats(artwork.artistId, 'likes');
      }
    }

    this.saveArtworks();
    this.saveUserLikes();
    return true;
  }

  isLikedByUser(artworkId, userId) {
    if (!userId || !this.userLikes[artworkId]) return false;
    return this.userLikes[artworkId].includes(userId);
  }

  deleteArtwork(artworkId, userId) {
    const artworkIndex = this.artworks.findIndex(a => a.id === artworkId);
    if (artworkIndex === -1) return false;

    const artwork = this.artworks[artworkIndex];

    // Only allow artist to delete their own artwork
    if (artwork.artistId !== userId) return false;

    // Remove artwork
    this.artworks.splice(artworkIndex, 1);

    // Remove likes for this artwork
    delete this.userLikes[artworkId];

    // Remove comments for this artwork
    if (window.artShareApp?.comments) {
      window.artShareApp.comments.deleteCommentsByArtwork(artworkId);
    }

    // Update user stats
    if (window.artShareApp?.auth) {
      window.artShareApp.auth.decrementUserStats(userId, 'artworks');
      // Decrease likes count by the number of likes this artwork had
      for (let i = 0; i < artwork.likes; i++) {
        window.artShareApp.auth.decrementUserStats(userId, 'likes');
      }
    }

    this.saveArtworks();
    this.saveUserLikes();
    return true;
  }

  updateArtwork(artworkId, updates, userId) {
    const artworkIndex = this.artworks.findIndex(a => a.id === artworkId);
    if (artworkIndex === -1) return false;

    const artwork = this.artworks[artworkIndex];

    // Only allow artist to update their own artwork
    if (artwork.artistId !== userId) return false;

    // Only allow certain fields to be updated
    const allowedFields = ['title', 'description', 'category', 'tags'];
    const filteredUpdates = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Validate updates
    if (filteredUpdates.title && filteredUpdates.title.length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (filteredUpdates.description && filteredUpdates.description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }

    // Update artwork
    this.artworks[artworkIndex] = {
      ...artwork,
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    };
    this.saveArtworks();

    return true;
  }

  incrementCommentCount(artworkId) {
    const artwork = this.artworks.find(a => a.id === artworkId);
    if (artwork) {
      artwork.comments++;
      this.saveArtworks();
      return true;
    }
    return false;
  }

  decrementCommentCount(artworkId) {
    const artwork = this.artworks.find(a => a.id === artworkId);
    if (artwork && artwork.comments > 0) {
      artwork.comments--;
      this.saveArtworks();
      return true;
    }
    return false;
  }

  getArtworksByCategory(category) {
    return this.artworks
      .filter(artwork => artwork.category === category)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  searchArtworks(query) {
    if (!query) return [];

    const term = query.toLowerCase();
    return this.artworks
      .filter(
        artwork =>
          artwork.title.toLowerCase().includes(term) ||
          artwork.description.toLowerCase().includes(term) ||
          artwork.artist.toLowerCase().includes(term) ||
          artwork.tags.some(tag => tag.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getPopularArtworks(limit = 10) {
    return this.artworks
      .sort(
        (a, b) =>
          b.likes + b.comments * 2 + b.views * 0.1 - (a.likes + a.comments * 2 + a.views * 0.1)
      )
      .slice(0, limit);
  }

  getRecentArtworks(limit = 10) {
    return this.artworks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  getRandomArtworks(limit = 6) {
    const shuffled = [...this.artworks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  getArtworkStats() {
    return {
      totalArtworks: this.artworks.length,
      totalLikes: this.artworks.reduce((sum, artwork) => sum + artwork.likes, 0),
      totalComments: this.artworks.reduce((sum, artwork) => sum + artwork.comments, 0),
      totalViews: this.artworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0),
      categoryCounts: this.getCategoryCounts(),
      averageLikesPerArtwork:
        this.artworks.length > 0
          ? (
              this.artworks.reduce((sum, artwork) => sum + artwork.likes, 0) / this.artworks.length
            ).toFixed(1)
          : 0
    };
  }

  getCategoryCounts() {
    const counts = {};
    this.artworks.forEach(artwork => {
      counts[artwork.category] = (counts[artwork.category] || 0) + 1;
    });
    return counts;
  }

  extractTags(text) {
    if (!text) return [];

    // Simple tag extraction - split by spaces and filter common words
    const commonWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should'
    ];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5); // Limit to 5 tags
  }

  generateArtworkId() {
    return `artwork_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  validateArtworkData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (data.title && data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (!data.imageUrl) {
      errors.push('Image is required');
    }

    const validCategories = ['digital', 'traditional', 'photography', '3d', 'other'];
    if (data.category && !validCategories.includes(data.category)) {
      errors.push('Invalid category selected');
    }

    return errors;
  }

  // For development/testing
  clearAllArtworks() {
    this.artworks = [];
    this.userLikes = {};
    this.saveArtworks();
    this.saveUserLikes();
  }

  // Import/Export functionality
  exportArtworks() {
    return {
      artworks: this.artworks,
      userLikes: this.userLikes,
      exportDate: new Date().toISOString()
    };
  }

  importArtworks(data) {
    if (data.artworks && Array.isArray(data.artworks)) {
      this.artworks = data.artworks;
      this.saveArtworks();
    }

    if (data.userLikes && typeof data.userLikes === 'object') {
      this.userLikes = data.userLikes;
      this.saveUserLikes();
    }

    return true;
  }
}
