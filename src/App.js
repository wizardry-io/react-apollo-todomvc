import React, { Component } from "react";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider, graphql } from "react-apollo";
import gql from "graphql-tag";
import compose from "lodash/flowRight";
import { HashRouter as Router, withRouter, Link } from "react-router-dom";

import "todomvc-app-css/index.css";
import "./App.css";

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

export const createTodoMutation = gql`
  mutation createTodo($data: TodoCreateInput!) {
    createTodo(data: $data) {
      id
      text
      completed
    }
  }
`;

Header = graphql(createTodoMutation, {
  props: ({ mutate }) => ({
    onNewTodo: ({ text }) => {
      mutate({
        variables: { data: { text, completed: false } },
        refetchQueries: [{ query: getTodosQuery }]
      });
    }
  })
})(Header);

class Main extends Component {
  render() {
    const {
      todos,
      completeAllTodos,
      uncompleteAllTodos,
      toggleTodo,
      removeTodo,
      location
    } = this.props;
    return todos && todos.length ? (
      <section className="main">
        <input
          className="toggle-all"
          type="checkbox"
          onChange={() =>
            todos.some(todo => todo.completed === false)
              ? completeAllTodos()
              : uncompleteAllTodos()
          }
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
                    onChange={() =>
                      toggleTodo({ id: todo.id, completed: !todo.completed })
                    }
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

export const getTodosQuery = gql`
  query GetTodos {
    todoes {
      id
      text
      completed
    }
  }
`;

const withTodos = graphql(getTodosQuery, {
  props: ({ data: { todoes } }) => {
    return {
      todos: todoes || []
    };
  }
});

export const completeAllTodosMutation = gql`
  mutation updateManyTodoes($data: TodoUpdateInput!, $where: TodoWhereInput!) {
    updateManyTodoes(data: $data, where: $where) {
      count
    }
  }
`;

const withCompleteAllTodos = graphql(completeAllTodosMutation, {
  props: ({ mutate }) => ({
    completeAllTodos: () =>
      mutate({
        variables: {
          data: { completed: true },
          where: { completed: false }
        },
        refetchQueries: [{ query: getTodosQuery }]
      }),
    uncompleteAllTodos: () =>
      mutate({
        variables: {
          data: { completed: false },
          where: { completed: true }
        },
        refetchQueries: [{ query: getTodosQuery }]
      })
  })
});

export const completeTodoMutation = gql`
  mutation updateTodo($data: TodoUpdateInput!, $where: TodoWhereUniqueInput!) {
    updateTodo(data: $data, where: $where) {
      id
      text
      completed
    }
  }
`;

const withToggleTodo = graphql(completeTodoMutation, {
  props: ({ mutate }) => ({
    toggleTodo: ({ id, completed }) =>
      mutate({
        variables: { where: { id }, data: { completed } },
        refetchQueries: [{ query: getTodosQuery }]
      })
  })
});

export const removeTodoMutation = gql`
  mutation deleteTodo($where: TodoWhereUniqueInput!) {
    deleteTodo(where: $where) {
      id
    }
  }
`;

const withRemoveTodo = graphql(removeTodoMutation, {
  props: ({ mutate }) => ({
    removeTodo: id => {
      mutate({
        variables: { where: { id } },
        refetchQueries: [{ query: getTodosQuery }]
      });
    }
  })
});

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
    const cache = new InMemoryCache({ dataIdFromObject: ({ key }) => key });
    const client = new ApolloClient({
      link: new HttpLink({
        uri: process.env.REACT_APP_GRAPHQL_API_URL
      }),
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
