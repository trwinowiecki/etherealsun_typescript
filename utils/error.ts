import { Error } from 'square';

const getError = (err: any) =>
  err.response && err.response.data && err.response.data.message
    ? `${err.response.status} - ${err.code}: ${err.response.data.message}`
    : err.message;

const getErrorSquare = (err: Error) =>
  err.detail
    ? `${err.category} - ${err.code}: ${err.detail}`
    : `${err.category} - ${err.code}`;

export { getError, getErrorSquare };
