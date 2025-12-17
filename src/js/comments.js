// Comments Manager
export class CommentManager {
  constructor() {
    this.comments = this.loadComments();
  }

  loadComments() {
    const comments = localStorage.getItem('artshare_comments');
    return comments ? JSON.parse(comments) : [];
  }

  saveComments() {
    localStorage.setItem('artshare_comments', JSON.stringify(this.comments));
  }

  addComment(artworkId, userId, username, text) {
    if (!artworkId || !userId || !username || !text.trim()) {
      return false;
    }

    if (text.length > 1000) {
      throw new Error('Comment must be less than 1000 characters');
    }

    const comment = {
      id: this.generateCommentId(),
      artworkId,
      userId,
      username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    this.comments.unshift(comment); // Add to beginning for chronological order
    this.saveComments();

    return comment;
  }

  getCommentsByArtwork(artworkId) {
    return this.comments
      .filter(comment => comment.artworkId === artworkId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getCommentById(commentId) {
    return this.comments.find(comment => comment.id === commentId);
  }

  updateComment(commentId, userId, newText) {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    const comment = this.comments[commentIndex];

    // Only allow comment author to update
    if (comment.userId !== userId) return false;

    if (!newText.trim() || newText.length > 1000) {
      return false;
    }

    comment.text = newText.trim();
    comment.updatedAt = new Date().toISOString();

    this.saveComments();
    return true;
  }

  deleteComment(commentId, userId) {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    const comment = this.comments[commentIndex];

    // Only allow comment author to delete (or artwork owner in future)
    if (comment.userId !== userId) return false;

    this.comments.splice(commentIndex, 1);
    this.saveComments();
    return true;
  }

  deleteCommentsByArtwork(artworkId) {
    this.comments = this.comments.filter(comment => comment.artworkId !== artworkId);
    this.saveComments();
  }

  deleteCommentsByUser(userId) {
    this.comments = this.comments.filter(comment => comment.userId !== userId);
    this.saveComments();
  }

  likeComment(commentId, userId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return false;

    // Initialize likes array if not exists
    if (!comment.likedBy) {
      comment.likedBy = [];
    }

    const userLikedIndex = comment.likedBy.indexOf(userId);

    if (userLikedIndex > -1) {
      // User already liked, remove like
      comment.likedBy.splice(userLikedIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // User hasn't liked, add like
      comment.likedBy.push(userId);
      comment.likes++;
    }

    this.saveComments();
    return true;
  }

  isCommentLikedByUser(commentId, userId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment || !comment.likedBy) return false;
    return comment.likedBy.includes(userId);
  }

  addReply(parentCommentId, userId, username, text) {
    if (!text.trim() || text.length > 500) {
      return false;
    }

    const parentComment = this.comments.find(c => c.id === parentCommentId);
    if (!parentComment) return false;

    const reply = {
      id: this.generateCommentId(),
      userId,
      username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    if (!parentComment.replies) {
      parentComment.replies = [];
    }

    parentComment.replies.unshift(reply);
    this.saveComments();

    return reply;
  }

  loadCommentsForModal(artworkId) {
    const comments = this.getCommentsByArtwork(artworkId);
    this.renderComments(comments);
  }

  renderComments(comments) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-comment" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.3;"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = comments.map(comment => this.renderComment(comment)).join('');

    // Add event listeners for comment interactions
    this.setupCommentEventListeners(container);
  }

  renderComment(comment) {
    const currentUser = window.artShareApp?.currentUser;
    const canEdit = currentUser && comment.userId === currentUser.id;
    const isLiked = currentUser && this.isCommentLikedByUser(comment.id, currentUser.id);

    return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author-info">
                        <span class="comment-author">${comment.username}</span>
                        <span class="comment-date">${this.formatDate(comment.createdAt)}</span>
                        ${comment.updatedAt ? '<span class="comment-edited">(edited)</span>' : ''}
                    </div>
                    <div class="comment-actions">
                        ${
                          canEdit
                            ? `
                            <button class="btn-icon edit-comment-btn" title="Edit comment">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-comment-btn" title="Delete comment">
                                <i class="fas fa-trash"></i>
                            </button>
                        `
                            : ''
                        }
                    </div>
                </div>
                <div class="comment-content">
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-edit-form" style="display: none;">
                        <textarea class="edit-comment-text" rows="3">${comment.text}</textarea>
                        <div class="edit-comment-actions">
                            <button class="btn btn-primary save-edit-btn">Save</button>
                            <button class="btn btn-secondary cancel-edit-btn">Cancel</button>
                        </div>
                    </div>
                </div>
                <div class="comment-footer">
                    <button class="btn-icon like-comment-btn ${isLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${comment.likes}</span>
                    </button>
                    ${
                      currentUser
                        ? `
                        <button class="btn-icon reply-comment-btn" data-comment-id="${comment.id}">
                            <i class="fas fa-reply"></i>
                            Reply
                        </button>
                    `
                        : ''
                    }
                </div>
                ${
                  comment.replies && comment.replies.length > 0
                    ? `
                    <div class="comment-replies">
                        ${comment.replies.map(reply => this.renderReply(reply, comment.id)).join('')}
                    </div>
                `
                    : ''
                }
                <div class="reply-form" style="display: none;">
                    <textarea class="reply-text" placeholder="Write a reply..." rows="2"></textarea>
                    <div class="reply-actions">
                        <button class="btn btn-primary post-reply-btn">Post Reply</button>
                        <button class="btn btn-secondary cancel-reply-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
  }

  renderReply(reply, parentId) {
    const currentUser = window.artShareApp?.currentUser;
    const canEdit = currentUser && reply.userId === currentUser.id;
    const isLiked = currentUser && reply.likedBy && reply.likedBy.includes(currentUser.id);

    return `
            <div class="comment reply" data-comment-id="${reply.id}" data-parent-id="${parentId}">
                <div class="comment-header">
                    <div class="comment-author-info">
                        <span class="comment-author">${reply.username}</span>
                        <span class="comment-date">${this.formatDate(reply.createdAt)}</span>
                    </div>
                    <div class="comment-actions">
                        ${
                          canEdit
                            ? `
                            <button class="btn-icon delete-reply-btn" title="Delete reply">
                                <i class="fas fa-trash"></i>
                            </button>
                        `
                            : ''
                        }
                    </div>
                </div>
                <div class="comment-content">
                    <p class="comment-text">${reply.text}</p>
                </div>
                <div class="comment-footer">
                    <button class="btn-icon like-reply-btn ${isLiked ? 'liked' : ''}" data-reply-id="${reply.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${reply.likes}</span>
                    </button>
                </div>
            </div>
        `;
  }

  setupCommentEventListeners(container) {
    const currentUser = window.artShareApp?.currentUser;

    // Edit comment
    container.querySelectorAll('.edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const text = comment.querySelector('.comment-text');
        const editForm = comment.querySelector('.comment-edit-form');

        text.style.display = 'none';
        editForm.style.display = 'block';
        editForm.querySelector('.edit-comment-text').focus();
      });
    });

    // Save edit
    container.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const commentId = comment.dataset.commentId;
        const newText = comment.querySelector('.edit-comment-text').value;

        if (this.updateComment(commentId, currentUser.id, newText)) {
          const artworkId = this.getCommentById(commentId).artworkId;
          this.loadCommentsForModal(artworkId);
        } else {
          window.artShareApp.ui.showToast('Error updating comment', 'error');
        }
      });
    });

    // Cancel edit
    container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const text = comment.querySelector('.comment-text');
        const editForm = comment.querySelector('.comment-edit-form');

        text.style.display = 'block';
        editForm.style.display = 'none';
      });
    });

    // Delete comment
    container.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const commentId = comment.dataset.commentId;

        if (confirm('Are you sure you want to delete this comment?')) {
          if (this.deleteComment(commentId, currentUser.id)) {
            const commentData = this.getCommentById(commentId);
            const artworkId = commentData ? commentData.artworkId : null;

            if (artworkId) {
              window.artShareApp.artwork.decrementCommentCount(artworkId);
              this.loadCommentsForModal(artworkId);
            }
          } else {
            window.artShareApp.ui.showToast('Error deleting comment', 'error');
          }
        }
      });
    });

    // Like comment
    container.querySelectorAll('.like-comment-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!currentUser) {
          window.artShareApp.ui.showToast('Please log in to like comments', 'warning');
          return;
        }

        const commentId = btn.dataset.commentId;
        if (this.likeComment(commentId, currentUser.id)) {
          const comment = this.getCommentById(commentId);
          btn.classList.toggle('liked');
          btn.querySelector('.like-count').textContent = comment.likes;
        }
      });
    });

    // Reply to comment
    container.querySelectorAll('.reply-comment-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const replyForm = comment.querySelector('.reply-form');

        replyForm.style.display = replyForm.style.display === 'block' ? 'none' : 'block';
        if (replyForm.style.display === 'block') {
          replyForm.querySelector('.reply-text').focus();
        }
      });
    });

    // Post reply
    container.querySelectorAll('.post-reply-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const commentId = comment.dataset.commentId;
        const replyText = comment.querySelector('.reply-text').value.trim();

        if (!replyText) return;

        if (this.addReply(commentId, currentUser.id, currentUser.username, replyText)) {
          const commentData = this.getCommentById(commentId);
          if (commentData) {
            this.loadCommentsForModal(commentData.artworkId);
          }
        } else {
          window.artShareApp.ui.showToast('Error posting reply', 'error');
        }
      });
    });

    // Cancel reply
    container.querySelectorAll('.cancel-reply-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const comment = btn.closest('.comment');
        const replyForm = comment.querySelector('.reply-form');

        replyForm.style.display = 'none';
        comment.querySelector('.reply-text').value = '';
      });
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  generateCommentId() {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCommentStats() {
    return {
      totalComments: this.comments.length,
      totalReplies: this.comments.reduce((sum, comment) => sum + (comment.replies?.length || 0), 0),
      totalLikes: this.comments.reduce((sum, comment) => sum + comment.likes, 0),
      activeCommenters: [...new Set(this.comments.map(comment => comment.userId))].length
    };
  }

  // Moderation methods (for future use)
  flagComment(commentId, userId, reason) {
    const comment = this.getCommentById(commentId);
    if (!comment) return false;

    if (!comment.flags) {
      comment.flags = [];
    }

    // Check if user already flagged this comment
    if (comment.flags.find(flag => flag.userId === userId)) {
      return false;
    }

    comment.flags.push({
      userId,
      reason,
      createdAt: new Date().toISOString()
    });

    this.saveComments();
    return true;
  }

  // For development/testing
  clearAllComments() {
    this.comments = [];
    this.saveComments();
  }

  // Search comments
  searchComments(query, artworkId = null) {
    let searchPool = this.comments;

    if (artworkId) {
      searchPool = this.getCommentsByArtwork(artworkId);
    }

    if (!query) return searchPool;

    const term = query.toLowerCase();
    return searchPool.filter(
      comment =>
        comment.text.toLowerCase().includes(term) || comment.username.toLowerCase().includes(term)
    );
  }
}
