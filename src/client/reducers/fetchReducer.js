import { FETCH } from '../actions/index';

export default (state={}, action) => {
  switch (action.type) {
    case FETCH:
      return action.payload;
    default:
      return state;
  }
}