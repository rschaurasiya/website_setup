const User = require('./User');
const Blog = require('./Blog');
const Category = require('./Category');
const Comment = require('./Comment');

// Associations
// User has many Blogs
User.hasMany(Blog, { foreignKey: 'authorId', as: 'blogs' });
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Category has many Blogs
Category.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });
Blog.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User has many Comments
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Blog has many Comments
Blog.hasMany(Comment, { foreignKey: 'blogId', as: 'comments' });
Comment.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });

module.exports = {
    User,
    Blog,
    Category,
    Comment
};
