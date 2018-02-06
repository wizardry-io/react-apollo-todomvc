import React from "react";
import ReactDOM from "react-dom";
import { mount, configure } from "enzyme";
import App from "./App";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("should hide `#main` and `#footer` when there are no todos", () => {
  const app = mount(<App />);
  expect(app.find(".main").exists()).toEqual(false);
  expect(app.find(".footer").exists()).toEqual(false);
});

it("should allow the user to add items", done => {
  const app = mount(<App />);
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Do the laundry" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  // Defer the test until the next tick
  setImmediate(() => {
    // Force a re-render
    app.update();
    expect(app.find(".todo-list li").length).toEqual(1);
    done();
  });
});

it("should clear the text input when the user adds an item", () => {
  const app = mount(<App />);
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Do the laundry" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  expect(app.find(".new-todo").props().value).toEqual("");
});
