import React, { Component } from "react";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { withClientState } from "apollo-link-state";
import { ApolloProvider, graphql } from "react-apollo";
import gql from "graphql-tag";

import "todomvc-app-css/index.css";

const cache = new InMemoryCache();

let nextTodoId = 0;

const stateLink = withClientState({
  cache,
  resolvers: {
    Mutation: {
      addTodo: (_, { text }, { cache }) => {
        const query = gql`
          query GetTodos {
            todos @client {
              id
              text
            }
          }
        `;
        const previous = cache.readQuery({ query });
        const newTodo = {
          id: nextTodoId,
          text,
          /**
           * Resolvers must return an object with a __typename property
           * [Source](https://www.apollographql.com/docs/link/links/state.html#resolver)
           */
          __typename: "TodoItem"
        };
        nextTodoId = nextTodoId + 1;
        const data = {
          todos: previous.todos.concat([newTodo])
        };
        cache.writeData({ data });
        return newTodo;
      }
    }
  },
  defaults: {
    todos: []
  }
});

const client = new ApolloClient({
  link: stateLink,
  cache
});

class Header extends Component {
  state = { text: "" };
  render() {
    const { onNewTodo } = this.props;
    return (
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          onChange={({ target }) =>
            this.setState(({ text }) => ({ text: target.value }))
          }
          onKeyPress={({ key }) => {
            if (key === "Enter") {
              onNewTodo({ text: this.state.text });
              this.setState({ text: "" });
            }
          }}
          value={this.state.text}
          placeholder="What needs to be done?"
        />
      </header>
    );
  }
}

Header = graphql(
  gql`
    mutation addTodo($text: String!) {
      addTodo(text: $text) @client
    }
  `,
  {
    props: ({ mutate }) => ({
      onNewTodo: ({ text }) => mutate({ variables: { text } })
    })
  }
)(Header);

class Main extends Component {
  render() {
    const { todos } = this.props;
    return todos && todos.length ? (
      <section className="main">
        <input className="toggle-all" type="checkbox" />
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id}>
              <div className="view">
                <input className="toggle" type="checkbox" />
                <label>{todo.text}</label>
                <button className="destroy" />
              </div>
              <input className="edit" onChange={() => {}} value={todo.text} />
            </li>
          ))}
        </ul>
      </section>
    ) : null;
  }
}

Main = graphql(
  gql`
    query {
      todos @client {
        id
        text
      }
    }
  `,
  {
    props: ({ data: { todos } }) => {
      return {
        todos
      };
    }
  }
)(Main);

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="todoapp">
          <Header />
          <Main />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
