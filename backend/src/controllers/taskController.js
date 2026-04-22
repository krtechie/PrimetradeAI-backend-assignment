const { z } = require('zod');
const { Task, User } = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// Zod validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

// GET /api/v1/tasks
// user → sees only their tasks, admin → sees all
const getAllTasks = async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, { tasks, count: tasks.length }, 'Tasks fetched successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    if (!task) return sendError(res, 'Task not found', 404);

    // user can only see their own task
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, { task }, 'Task fetched successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/tasks
const createTask = async (req, res, next) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 400);
    }

    const { title, description, status } = parsed.data;

    const task = await Task.create({
      title,
      description,
      status,
      userId: req.user.id,
    });

    return sendSuccess(res, { task }, 'Task created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 400);
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    // only owner or admin can update
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return sendError(res, 'Access denied', 403);
    }

    await task.update(parsed.data);

    return sendSuccess(res, { task }, 'Task updated successfully');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    // only owner or admin can delete
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return sendError(res, 'Access denied', 403);
    }

    await task.destroy();

    return sendSuccess(res, {}, 'Task deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };