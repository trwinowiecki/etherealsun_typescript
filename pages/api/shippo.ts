/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { ShippoCommand } from '../../enums/ShippoCommands';

export interface ShippoRequest extends NextApiRequest {
  body: { type: ShippoCommand; address?: ShippoAddressRequest };
}

export interface ShippoAddressResponse {
  city?: string;
  company?: string;
  country?: string;
  email?: string;
  is_complete?: boolean;
  is_residential?: boolean;
  latitude?: number;
  longitude?: number;
  metadata?: string;
  name?: string;
  object_created?: string;
  object_id?: string;
  object_owner?: string;
  object_updated?: string;
  phone?: string;
  state?: string;
  street1?: string;
  street2?: string;
  street3?: string;
  street_no?: string;
  test?: boolean;
  validation_results?: {
    is_valid?: boolean;
    messages?: {
      code?: string;
      source?: string;
      text?: string;
      type?:
        | 'address_error'
        | 'address_warning'
        | 'address_correction'
        | 'geocode_level'
        | 'geocode_error'
        | 'service_error';
    }[];
  };
  zip?: string;
}

export interface ShippoAddressRequest {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  street3?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export const shippoAPI = axios.create({
  baseURL: 'https://api.goshippo.com/v1/',
  headers: {
    Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`
  }
});

const handler = async (req: ShippoRequest, res: NextApiResponse) => {
  switch (req.body.type) {
    case ShippoCommand.VALIDATE_ADDRESS:
      validateAddress(req.body.address!, res);
      break;
    default:
      console.error('Invalid Shippo command: ', req.body.type);
      res
        .status(400)
        .send({ message: `Invalid Shippo command: ${req.body.type}` });
  }
};

const validateAddress = (
  addressData: ShippoAddressRequest,
  res: NextApiResponse
) => {
  shippoAPI
    .post('addresses', {
      ...addressData,
      validate: true
    })
    .then(({ data }) => {
      res.status(200).send(data);
    })
    .catch((err: any) => {
      res.status(400).send(err);
    });
};

export default handler;
