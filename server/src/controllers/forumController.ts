import { Request, Response, NextFunction } from 'express';
import { ForumService } from '../services/forumService';
import { PostType } from '../models/Forum';
import mongoose from 'mongoose';

// Post Controllers

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorId = new mongoose.Types.ObjectId(req.user!.userId);
    const post = await ForumService.createPost(authorId, req.body);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const post = await ForumService.getPostById(postId, true);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found'
      });
      return;
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: any = {};

    if (req.query.postType) filters.postType = req.query.postType as PostType;
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.tags) filters.tags = (req.query.tags as string).split(',');
    if (req.query.targetScore) filters.targetScore = Number(req.query.targetScore);
    if (req.query.author) filters.author = new mongoose.Types.ObjectId(req.query.author as string);
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    if (req.query.page) filters.page = Number(req.query.page);
    if (req.query.limit) filters.limit = Number(req.query.limit);

    const result = await ForumService.getPosts(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const authorId = new mongoose.Types.ObjectId(req.user!.userId);

    const post = await ForumService.updatePost(postId, authorId, req.body);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const isAdmin = req.user!.role === 'admin';

    await ForumService.deletePost(postId, userId, isAdmin);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const closePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const post = await ForumService.closePost(postId, userId);

    res.json({
      success: true,
      message: 'Post closed successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUpvote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const post = await ForumService.toggleUpvote(postId, userId);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDownvote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const post = await ForumService.toggleDownvote(postId, userId);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Comment Controllers

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const authorId = new mongoose.Types.ObjectId(req.user!.userId);
    const { content, parentId } = req.body;

    const comment = await ForumService.createComment(
      postId,
      authorId,
      content,
      parentId ? new mongoose.Types.ObjectId(parentId) : undefined
    );

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await ForumService.getComments(postId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentId = new mongoose.Types.ObjectId(req.params.id);
    const authorId = new mongoose.Types.ObjectId(req.user!.userId);
    const { content } = req.body;

    const comment = await ForumService.updateComment(commentId, authorId, content);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const isAdmin = req.user!.role === 'admin';

    await ForumService.deleteComment(commentId, userId, isAdmin);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCommentUpvote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const comment = await ForumService.toggleCommentUpvote(commentId, userId);

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCommentDownvote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const comment = await ForumService.toggleCommentDownvote(commentId, userId);

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const commentId = new mongoose.Types.ObjectId(req.params.commentId);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const post = await ForumService.acceptAnswer(postId, commentId, userId);

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const tags = await ForumService.getTrendingTags(limit);

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

export const getUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId || req.user!.userId);
    const activity = await ForumService.getUserActivity(userId);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

export const pinPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const post = await ForumService.pinPost(postId);

    res.json({
      success: true,
      message: 'Post pin toggled successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const featurePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const post = await ForumService.featurePost(postId);

    res.json({
      success: true,
      message: 'Post feature toggled successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};
