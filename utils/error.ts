import { AxiosError } from 'axios';
import { Error } from 'square';
import { ShippoAddressResponse } from '../pages/api/shippo';

const getError = (err: any) =>
  err.response?.data?.message
    ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `${err.response.status} - ${err.code}: ${err.response.data.message}`
    : err.message;

const getErrorSquare = (err: Error) =>
  err.detail
    ? `${err.category} - ${err.code}: ${err.detail}`
    : `${err.category} - ${err.code}`;

const getErrorShippo = (err: ShippoAddressResponse | AxiosError) => {
  if (err instanceof AxiosError && err.code === 'ERR_BAD_RESPONSE') {
    return err.message;
  }

  const message = (err as ShippoAddressResponse).validation_results?.messages
    ?.map(m => m.text)
    .join('\n');
  return message;
};

export { getError, getErrorShippo, getErrorSquare };
