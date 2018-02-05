import React, { Component } from "react";
import "todomvc-app-css/index.css";

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
              onNewTodo(this.state.text);
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

const Main = ({ todos }) =>
  todos.length ? (
    <section className="main">
      <input className="toggle-all" type="checkbox" />
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo}>
            <div className="view">
              <input className="toggle" type="checkbox" />
              <label>{todo}</label>
              <button className="destroy" />
            </div>
            <input className="edit" onChange={() => {}} value={todo} />
          </li>
        ))}
      </ul>
    </section>
  ) : null;

class App extends Component {
  state = {
    todos: []
  };
  render() {
    return (
      <div className="todoapp">
        <Header
          onNewTodo={todo =>
            this.setState(({ todos }) => ({ todos: todos.concat([todo]) }))
          }
        />
        <Main todos={this.state.todos} />
      </div>
    );
  }
}

export default App;
