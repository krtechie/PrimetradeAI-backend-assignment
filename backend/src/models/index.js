const sequelize = require('../config/db');
const UserModel = require('./User');
const TaskModel = require('./Task');

const User = UserModel(sequelize);
const Task = TaskModel(sequelize);

// Associations
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Task };