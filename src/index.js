import 'babel-polyfill';
import express from 'express';
import { matchRoutes } from 'react-router-config';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './client/reducers';
import renderer from './renderer';
import routes from './routes';

const app = express();
app.use(express.static('public'));

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