import React from "react";
import ReactDOM from "react-dom";
import { mount, configure } from "enzyme";
import App, {
  getTodosQuery,
  createTodoMutation,
  completeAllTodosMutation,
  completeTodoMutation,
  removeTodoMutation
} from "./App";
import { addTypenameToDocument } from "apollo-utilities";
import Adapter from "enzyme-adapter-react-16";
import { MockedProvider } from "react-apollo/test-utils";

configure({ adapter: new Adapter() });

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MockedProvider>
      <App />
    </MockedProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it("should hide `#main` and `#footer` when there are no todos", () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  expect(app.find(".main").exists()).toEqual(false);
  expect(app.find(".footer").exists()).toEqual(false);
});

it("should allow the user to add items", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Do the laundry",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Do the laundry",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Do the laundry",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Do the laundry" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  expect(app.find(".todo-list li").length).toEqual(1);
});

it("should clear the text input when the user adds an item", () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Do the laundry",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Do the laundry",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Do the laundry",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Do the laundry" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  expect(app.find(".new-todo").props().value).toEqual("");
});

it("should allow users to complete all items", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Sleep like a dog",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Sleep like a dog",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Bark at mailman",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 2,
                text: "Bark at mailman",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: false,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Bark at mailman",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: { query: addTypenameToDocument(completeAllTodosMutation) },
          result: {
            data: {
              updateManyTodoes: {
                count: 2,
                __typename: "BatchPayload"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: true,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Bark at mailman",
                  completed: true,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Sleep like a dog" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Bark at mailman" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app.find(".toggle-all").simulate("change", { target: { value: true } });
  await update(app);
  expect(app.find(".todo-list li.completed").length).toEqual(2);
});

it("should allow users to remove complete from all items", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Sleep like a dog",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Sleep like a dog",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Bark at mailman",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 2,
                text: "Bark at mailman",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: false,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Bark at mailman",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: { query: addTypenameToDocument(completeAllTodosMutation) },
          result: {
            data: {
              updateManyTodoes: {
                count: 2,
                __typename: "BatchPayload"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: true,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Bark at mailman",
                  completed: true,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: { query: addTypenameToDocument(completeAllTodosMutation) },
          result: {
            data: {
              updateManyTodoes: {
                count: 2,
                __typename: "BatchPayload"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Sleep like a dog",
                  completed: false,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Bark at mailman",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Sleep like a dog" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Bark at mailman" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app.find(".toggle-all").simulate("change");
  await update(app);
  expect(app.find(".todo-list li.completed").length).toEqual(2);
  app.find(".toggle-all").simulate("change");
  await update(app);
  expect(app.find(".todo-list li.completed").length).toEqual(0);
});

it("should allow users to complete an item", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Chase my own tail",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(completeTodoMutation),
            variables: {
              data: {
                completed: true,
                __typename: "Todo"
              },
              where: {
                id: 1
              }
            }
          },
          result: {
            data: {
              updateTodo: {
                id: 1,
                text: "Chase my own tail",
                completed: true,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Chase my own tail",
                  completed: true,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(completeTodoMutation),
            variables: {
              data: {
                completed: false,
                __typename: "Todo"
              },
              where: {
                id: 1
              }
            }
          },
          result: {
            data: {
              updateTodo: {
                id: 1,
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Chase my own tail",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Chase my own tail" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app.find(".toggle").simulate("change");
  await update(app);
  expect(app.find(".todo-list li.completed").length).toEqual(1);
  app.find(".toggle").simulate("change");
  await update(app);
  expect(app.find(".todo-list li.completed").length).toEqual(0);
});

it("should allow users to remove an item", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Chase my own tail",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(removeTodoMutation),
            variables: {
              where: {
                id: 1,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              deleteTodo: {
                id: 1,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: []
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Chase my own tail" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app.find(".destroy").simulate("click");
  await update(app);
  expect(app.find(".todo-list li").length).toEqual(0);
});

it("should only show active todos on /active", async () => {
  const app = mount(
    <MockedProvider
      mocks={[
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: { data: { todoes: [] } }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Be the best friend",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 1,
                text: "Be the best friend",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Be the best friend",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(completeTodoMutation),
            variables: {
              data: {
                completed: true,
                __typename: "Todo"
              },
              where: {
                id: 1
              }
            }
          },
          result: {
            data: {
              updateTodo: {
                id: 1,
                text: "Be the best friend",
                completed: true,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Be the best friend",
                  completed: true,
                  __typename: "Todo"
                }
              ]
            }
          }
        },
        {
          request: {
            query: addTypenameToDocument(createTodoMutation),
            variables: {
              data: {
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          },
          result: {
            data: {
              createTodo: {
                id: 2,
                text: "Chase my own tail",
                completed: false,
                __typename: "Todo"
              }
            }
          }
        },
        {
          request: { query: addTypenameToDocument(getTodosQuery) },
          result: {
            data: {
              todoes: [
                {
                  id: 1,
                  text: "Be the best friend",
                  completed: true,
                  __typename: "Todo"
                },
                {
                  id: 2,
                  text: "Chase my own tail",
                  completed: false,
                  __typename: "Todo"
                }
              ]
            }
          }
        }
      ]}
    >
      <App />
    </MockedProvider>
  );
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Be the best friend" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  app.find(".toggle").simulate("change");
  await update(app);
  app
    .find(".new-todo")
    .simulate("change", { target: { value: "Chase my own tail" } });
  app.find(".new-todo").simulate("keypress", { key: "Enter" });
  await update(app);
  /**
   * Added { button: 0 } to simulate() because otherwise the test fails because <Link /> checks that event.button === 0.
   * Source: https://github.com/airbnb/enzyme/issues/516
   */
  app.find('a[href="/active"]').simulate("click", { button: 0 });
  await update(app);
  expect(app.find(".todo-list li").length).toEqual(1);
  app.find('a[href="/"]').simulate("click", { button: 0 });
  await update(app);
  expect(app.find(".todo-list li").length).toEqual(2);
});

function update(wrapper, time = 100) {
  return (
    // Defer the test
    new Promise(resolve => setTimeout(resolve, time))
      // Force a re-render
      .then(() => wrapper.update())
  );
}
