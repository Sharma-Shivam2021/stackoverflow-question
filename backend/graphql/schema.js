const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLInputObjectType,
} = require("graphql");

const UserInputType = new GraphQLInputObjectType({
  name: "UserInputData",
  fields: () => ({
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const PostInputType = new GraphQLInputObjectType({
  name: "PostInputData",
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    status: { type: GraphQLString },
    posts: { type: new GraphQLList(PostType) },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    creator: { type: UserType },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const AuthDataType = new GraphQLObjectType({
  name: "AuthData",
  fields: () => ({
    token: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});

const PostDataType = new GraphQLObjectType({
  name: "PostData",
  fields: () => ({
    posts: { type: new GraphQLList(PostType) },
    totalPosts: { type: GraphQLInt },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    login: {
      type: AuthDataType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
    },
    posts: {
      type: PostDataType,
    },
  },
});

const RootMutationType = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        userInput: { type: UserInputType },
      },
    },
    createPost: {
      type: PostType,
      args: {
        postInput: { type: PostInputType },
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

module.exports = schema;
