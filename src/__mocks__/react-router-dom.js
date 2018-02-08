/**
 * Mock React Router DOM by replacing HashRouter with MemoryRouter.
 * HashRouter uses the HTML5 history API and, since the tests are in NodeJS, we need to use MemoryRouter.
 */
const ReactRouterDOM = require("react-router-dom");

ReactRouterDOM.HashRouter = ReactRouterDOM.MemoryRouter;

module.exports = ReactRouterDOM;
