/**
 * Mock React Apollo's ApolloProvider because we want to use MockedProvider in our tests.
 * We replace ApolloProvider with a Fragment that simply returns its children.
 * The reason we don't replace ApolloProvider with MockedProvider in this mock is that
 * we pass a different mocks property (which is just an array of objects with request and result) in each test to MockedProvider.
 */
import React, { Fragment } from "react";
const ReactApollo = require("react-apollo");

ReactApollo.ApolloProvider = ({ children }) => <Fragment>{children}</Fragment>;

module.exports = ReactApollo;
