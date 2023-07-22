const { login, saveBook } = require("../controllers/user-controller");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const userData = await User.findById(user._id);
      return userData;
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id }, 
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new Error("Unable to save the book!");
      }
    },
    removeBook: async (parent, { bookId }, context) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("Unable to find user with this id!");
        }
        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new Error("Unable to remove the book!");
      }
    },
  },
};

module.exports = resolvers;
