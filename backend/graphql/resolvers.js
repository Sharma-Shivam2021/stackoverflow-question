const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "SuperLongSecretKeyWithMultipleCharacters";

const Post = require("../models/post");
const User = require("../models/user");

const createUser = async ({ userInput }, req) => {
  const errors = [];
  if (!validator.isEmail(userInput.email)) {
    errors.push({ message: "Email is Invalid" });
  }
  if (
    validator.isEmpty(userInput.password) ||
    !validator.isLength(userInput.password, { min: 5 })
  ) {
    errors.push({ message: "Password is Invalid" });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid Input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const existingUser = await User.findOne({ email: userInput.email });
  if (existingUser) {
    const error = new Error("User Exists already");
    throw error;
  }
  const hashedPassword = await bcrypt.hash(userInput.password, 12);
  const user = new User({
    email: userInput.email,
    name: userInput.name,
    password: hashedPassword,
  });
  const createdUser = await user.save();
  return { ...createdUser._doc, _id: createdUser._id.toString() };
};

const login = async ({ email, password }, req) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new Error("user not found");
    error.code = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("password incorrect");
    error.code = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  console.log(token);
  return { token: token, userId: user._id.toString() };
};

const createPost = async ({ postInput }, req) => {
  console.log(req);
  if (!req.isAuth) {
    const error = new Error("Not Authenticated");
    error.code = 401;
    throw error;
  }
  const errors = [];
  if (
    validator.isEmpty(postInput.title) ||
    !validator.isLength(postInput.title, { min: 5 })
  ) {
    errors.push("Title is invalid");
  }
  if (
    validator.isEmpty(postInput.content) ||
    !validator.isLength(postInput.content, { min: 5 })
  ) {
    errors.push("Content is invalid");
  }
  if (errors.length > 0) {
    const error = new Error("Invalid Input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("Invalid User");
    error.code = 401;
    throw error;
  }
  const post = new Post({
    title: postInput.title,
    content: postInput.content,
    imageUrl: postInput.imageUrl,
    creator: user,
  });
  const createdPost = await post.save();
  user.posts.push(createdPost);
  console.log('Done Succesfully');
  return {
    ...createdPost._doc,
    _id: createdPost._id.toString(),
    createsAt: createdPost.createdAt.toISOString(),
    updatedAt: createdPost.updatedAt.toISOString(),
  };
};

module.exports = {
  createUser: createUser,
  login: login,
  createPost: createPost,
};
