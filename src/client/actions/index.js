import axios from 'axios';

export const FETCH = 'FETCH';

export const fetch = () => async dispatch => {
  //const response = await axios.get('URL to fetch if any');
  const response = 'Here is the trial page';

  dispatch({
    type: FETCH,
    payload: response
  });
}