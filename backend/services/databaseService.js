// services/databaseService.js - Database Operations Service
import User from '../models/User.js';
import Content from '../models/Content.js';
import Analytics from '../models/Analytics.js';
import mongoose from 'mongoose';

class DatabaseService {
  // ===== USER OPERATIONS =====

  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();

      // Remove password from response
      const userObject = user.toObject();
      delete userObject.password;

      return { success: true, user: userObject };
    } catch (error) {
      if (error.code === 11000) {
        return { success: false, error: 'Email already exists' };
      }
      return { success: false, error: error.message };
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  async findUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  }

  async updateUserCredits(userId, creditsUsed) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.hasCredits(creditsUsed)) {
        return { success: false, error: 'Insufficient credits' };
      }

      await user.useCredits(creditsUsed);
      return { success: true, credits_remaining: user.subscription.credits_remaining };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== CONTENT OPERATIONS =====

  async saveContent(contentData) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Create content document
      const content = new Content(contentData);
      await content.save({ session });

      // Update user stats
      await User.findByIdAndUpdate(
        contentData.user_id,
        {
          $inc: { 'usage_stats.total_content': 1 },
          $set: { 'usage_stats.last_content_created': new Date() }
        },
        { session }
      );

      // Use credits
      const user = await User.findById(contentData.user_id).session(session);
      if (user && user.hasCredits(1)) {
        await user.useCredits(1);
      }

      await session.commitTransaction();

      return { success: true, content: content.toObject() };
    } catch (error) {
      await session.abortTransaction();
      return { success: false, error: error.message };
    } finally {
      session.endSession();
    }
  }

  async getUserContent(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1,
        platform = null,
        sentiment = null,
        is_favorite = null,
        is_archived = false
      } = options;

      // Build query
      const query = { user_id: userId, is_archived };

      if (platform) {
        query.platforms = platform;
      }

      if (sentiment) {
        query['sentiment.label'] = sentiment;
      }

      if (is_favorite !== null) {
        query.is_favorite = is_favorite;
      }

      // Execute query with pagination
      const content = await Content.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user_id', 'email profile.name')
        .exec();

      const total = await Content.countDocuments(query);

      return {
        success: true,
        content,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getContentById(contentId, userId = null) {
    try {
      const query = { _id: contentId };
      if (userId) query.user_id = userId;

      const content = await Content.findOne(query)
        .populate('user_id', 'email profile.name');

      if (!content) {
        return { success: false, error: 'Content not found' };
      }

      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateContent(contentId, userId, updateData) {
    try {
      const content = await Content.findOneAndUpdate(
        { _id: contentId, user_id: userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!content) {
        return { success: false, error: 'Content not found' };
      }

      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteContent(contentId, userId) {
    try {
      const content = await Content.findOneAndDelete({
        _id: contentId,
        user_id: userId
      });

      if (!content) {
        return { success: false, error: 'Content not found' };
      }

      return { success: true, message: 'Content deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== ANALYTICS OPERATIONS =====

  async logEvent(eventData) {
    try {
      const analytics = new Analytics(eventData);
      await analytics.save();
      return { success: true };
    } catch (error) {
      console.error('Analytics logging error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserAnalytics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user content stats
      const contentStats = await Content.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total_content: { $sum: 1 },
            avg_sentiment: { $avg: '$sentiment.score' },
            platforms: { $push: '$platforms' },
            sentiments: { $push: '$sentiment.label' }
          }
        }
      ]);

      // Get event analytics
      const eventStats = await Analytics.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$event_type',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get platform usage
      const platformStats = await Analytics.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            platform: { $exists: true },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        success: true,
        analytics: {
          content_stats: contentStats[0] || {},
          event_stats: eventStats,
          platform_stats: platformStats,
          period_days: days
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== UTILITY OPERATIONS =====

  async searchContent(userId, searchQuery, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const query = {
        user_id: userId,
        $or: [
          { original_content: new RegExp(searchQuery, 'i') },
          { tags: new RegExp(searchQuery, 'i') },
          { 'sentiment.keywords': new RegExp(searchQuery, 'i') }
        ]
      };

      const content = await Content.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Content.countDocuments(query);

      return {
        success: true,
        content,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDashboardStats(userId) {
    try {
      const user = await User.findById(userId).select('usage_stats subscription');
      const recentContent = await Content.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('original_content sentiment platforms createdAt');

      const totalContent = await Content.countDocuments({ user_id: userId });
      const favoriteContent = await Content.countDocuments({ 
        user_id: userId, 
        is_favorite: true 
      });

      return {
        success: true,
        stats: {
          user_info: user,
          total_content: totalContent,
          favorite_content: favoriteContent,
          recent_content: recentContent
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new DatabaseService();