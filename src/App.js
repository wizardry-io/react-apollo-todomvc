import React, { Component } from "react";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { withClientState } from "apollo-link-state";
import { ApolloProvider, graphql } from "react-apollo";
import gql from "graphql-tag";
import compose from "lodash/flowRight";
import { HashRouter as Router, withRouter, Link } from "react-router-dom";

import "todomvc-app-css/index.css";
import "./App.css";

let nextTodoId = 0;

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
    const {
      todos,
      completeAllTodos,
      toggleTodo,
      removeTodo,
      location
    } = this.props;
    return todos && todos.length ? (
      <section className="main">
        <input
          className="toggle-all"
          type="checkbox"
          onChange={completeAllTodos}
          checked={false}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {todos
            .filter(todo => {
              if (location.pathname === "/completed") {
                return todo.completed;
              }
              if (location.pathname === "/active") {
                return !todo.completed;
              }
              return true;
            })
            .map(todo => (
              <li
                key={todo.id}
                className={todo.completed ? "completed" : undefined}
              >
                <div className="view">
                  <input
                    className="toggle"
                    onChange={() => toggleTodo(todo.id)}
                    checked={todo.completed}
                    type="checkbox"
                  />
                  <label>{todo.text}</label>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="destroy"
                  />
                </div>
                <input className="edit" onChange={() => {}} value={todo.text} />
              </li>
            ))}
        </ul>
      </section>
    ) : null;
  }
}

const getTodosQuery = gql`
  query GetTodos {
    todos @client {
      id
      text
      completed
    }
  }
`;

const withTodos = graphql(getTodosQuery, {
  props: ({ data: { todos } }) => {
    return {
      todos
    };
  }
});

const withCompleteAllTodos = graphql(
  gql`
    mutation completeAllTodos {
      completeAllTodos @client
    }
  `,
  {
    props: ({ mutate }) => ({
      completeAllTodos: mutate
    })
  }
);

const withToggleTodo = graphql(
  gql`
    mutation toggleTodo($id: Integer!) {
      toggleTodo(id: $id) @client
    }
  `,
  {
    props: ({ mutate }) => ({
      toggleTodo: id => mutate({ variables: { id } })
    })
  }
);

const withRemoveTodo = graphql(
  gql`
    mutation removeTodo($id: Integer!) {
      removeTodo(id: $id) @client
    }
  `,
  {
    props: ({ mutate }) => ({
      removeTodo: id => mutate({ variables: { id } })
    })
  }
);

Main = compose(
  withRouter,
  withTodos,
  withCompleteAllTodos,
  withToggleTodo,
  withRemoveTodo
)(Main);

class Footer extends Component {
  render() {
    const { location, todos } = this.props;
    return todos.length ? (
      <footer className="footer">
        <span className="todo-count">
          <strong>0</strong> item left
        </span>
        <ul className="filters">
          <li>
            <Link
              className={location.pathname === "/" ? "selected" : undefined}
              to="/"
            >
              All
            </Link>
          </li>
          <li>
            <Link
              className={
                location.pathname === "/active" ? "selected" : undefined
              }
              to="/active"
            >
              Active
            </Link>
          </li>
          <li>
            <Link
              className={
                location.pathname === "/completed" ? "completed" : undefined
              }
              to="/completed"
            >
              Completed
            </Link>
          </li>
        </ul>
        <button className="clear-completed">Clear completed</button>
      </footer>
    ) : null;
  }
}

Footer = compose(withRouter, withTodos)(Footer);

class App extends Component {
  constructor() {
    super();
    const cache = new InMemoryCache();
    const stateLink = withClientState({
      cache,
      resolvers: {
        Mutation: {
          addTodo: (_, { text }, { cache }) => {
            const previous = cache.readQuery({ query: getTodosQuery });
            const newTodo = {
              id: nextTodoId,
              text,
              completed: false,
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
          },
          completeAllTodos: (_, variables, { cache }) => {
            const previous = cache.readQuery({ query: getTodosQuery });
            const areAllCompleted = previous.todos.every(
              todo => todo.completed
            );
            const data = {
              todos: previous.todos.map(todo => ({
                ...todo,
                completed: areAllCompleted ? false : true
              }))
            };
            cache.writeData({ data });
            return null;
          },
          toggleTodo: (_, { id }, { cache }) => {
            const previous = cache.readQuery({ query: getTodosQuery });
            const data = {
              todos: previous.todos.map(todo => {
                if (todo.id !== id) {
                  return todo;
                }
                return {
                  ...todo,
                  completed: !todo.completed
                };
              })
            };
            cache.writeData({ data });
            return null;
          },
          removeTodo: (_, { id }, { cache }) => {
            const previous = cache.readQuery({ query: getTodosQuery });
            const data = {
              todos: previous.todos.filter(todo => todo.id !== id)
            };
            cache.writeData({ data });
            return null;
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
    this.state = {
      cache,
      client
    };
  }
  render() {
    return (
      <Router>
        <ApolloProvider client={this.state.client}>
          <div className="todoapp">
            <Header />
            <Main />
            <Footer />
          </div>
        </ApolloProvider>
      </Router>
    );
  }
}

export default App;
