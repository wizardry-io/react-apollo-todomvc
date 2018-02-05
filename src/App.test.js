import React from "react";
import ReactDOM from "react-dom";
import { shallow, configure } from "enzyme";
import App from "./App";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("should hide `#main` and `#footer` when there are no todos", () => {
  const app = shallow(<App />);
  expect(app.find(".main").exists()).toEqual(false);
  expect(app.find(".footer").exists()).toEqual(false);
});
