# How To Master React Server Side Rendering for SEO and Faster Initial Page Load

## Why Server Side Rendering
Server side rendering renders the initial page faster than client side rendering does.

In addition, since most of the search engines and crawlers see client side rendered pages as blank pages due to the reason that they do not run javascript, server side rendering is a must for the good SEO performance. Otherwise a website might be indexed as blank. GoogleBot has been indexing client side rendered pages by running javascript but it is not perfect and reliable yet. Choosing SSR is still much better option in terms of SEO.

## The Main Objective Of The BoilerPlate

What is so important about this boilerplate is that server response (html) contains all the required data loaded with asynchrous http requests. There are enormous advantages of this approach:

- Search engines and crawlers see all the rich content.
- The requested page loaded instantly in the browser when the response come.
- Running javascript is not required in the browser

# How It Works

In this project, 2 javascript bundles are created with webpack. The server bundle is created into build directory and executed in the server side. The client bundle is created into public directory and sent to the browser to be executed.

If you don't want to create server side bundle, remove webpack for server side and execute server code with "babel-node" instead of "node".

Official description of [babel-node](https://babeljs.io/docs/en/next/babel-node.html):
"babel-node is a CLI that works exactly the same as the Node.js CLI, with the added benefit of compiling with Babel presets and plugins before running it"

To start project in a localhost, execute 'dev' script. 

```
npm run dev
```

It creates server and client bundles and runs build/bundle.js using Node to start the express server.

### index.js

First import required packages:

```
import 'babel-polyfill';
import express from 'express';
import { matchRoutes } from 'react-router-config';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './client/reducers';
import renderer from './renderer';
import routes from './routes';
```

Babel polyfill is required for some new ES6 features like Map and Promise.

Next express server,

- Make public directory static. Now it is available to outside:

```
const app = express();
app.use(express.static('public'));
```

Handling all requests coming:

- We create store and initialize it with the required data.

- Using 'matchRoutes', the route user trying to visit with a request can be found. What is very important about 'matchRoutes' is that unlike 'react-router-dom' it returns array of components to be rendered in that route before rendering any component.

- 'loadData' functions are defined in components and put into 'routes.js'. Since they are generally async api requests, wait for them to resolve and send html returned by 'renderer' to client. Thanks to 'loadData' calls, store is now full of data.

- Finally, listen for connections.

```
app.get('*', (req, res) => {
  const store = createStore(reducers, {}, applyMiddleware(thunk));

  const currentRoute = matchRoutes(routes, req.path);

  const need = currentRoute.map(({route}) => {
    return route.loadData ? route.loadData(store) : null;
  });

  Promise.all(need).then(() => {
    res.send(renderer(req, store));
  });
});

app.listen(3000, () => {
  console.log('Listening on port 3000')
});
```

### renderer.js

In 'renderer', we define html to be sent to the client.

- 'renderToString' takes React element and renders it to the initial html.

- In the server side, 'StaticRouter' is used instead of 'BrowserRouter', since the location is not actually changing unlike it does in browsers. As it's name implies, it is static. Therefore, the current location must be passed via 'location' prop.

- 'serialize' is used instead of 'JSON.Stringfy' to convert javascript object to json.(Both can be used, 'serialize' safer(XSS))

- Instead of defining routes with 'Route' from react-route-dom, we use 'renderRoutes' to make routes able to match with 'matchRoutes' (in index.js) outside the rendering process. 

- 'window.INITIAL_STATE' is to send the states of preloaded store to the client.

- 'bundle.js' is the webpack bundle of the client side javascript to bind event handlers in the browser. It hydrates the div with id 'root'.  

```
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';

export default (req, store) => {
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path} context={{}}>
        <div>{renderRoutes(routes)}</div>
      </StaticRouter>
    </Provider>
  );

  return `
    <html>
        <head></head>
        <body>
            <div id='root'>${content}</div>
            <script>
                window.INITIAL_STATE = ${serialize(store.getState())}
            </script>
            <script src='bundle.js'></script>
        </body>
    </html>
  `;
}
```

### routes.js

As you noticed, entire routing process is completely different in server side rendering in order to figure out which components will be rendered before rendering any.

```
import React from "react";
import Home from "./client/components/Home";
import Trial from "./client/components/Trial";
import { loadData } from "./client/components/Trial";

export default [
  {
    component: Home,
    path: "/",
    exact: true
  },
  {
    component: Trial,
    loadData: loadData,
    path: "/trial",
  }
];
```

### client.js

Client side code is pretty straightforward. 

- Here, ReactDOM.render is replaced with 'hydrate'. It is used for hdrating html elements send by server using 'react-dom/server renderToString' function.

- Initial store states preloaded in server is used in createStore.

```
const store = createStore(
  reducers,
  window.INITIAL_STATE,
  applyMiddleware(thunk));

ReactDOM.hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <div>{renderRoutes(Routes)}</div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'));
```

### Trial.js

'loadData' functions are defined in components and called in 'index.js' as explained above to preload the store in server side.

```
function loadData(store) {
  return store.dispatch(fetch());
}


