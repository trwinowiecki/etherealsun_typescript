/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { ShippoCommand } from '../../enums/ShippoCommands';

export type ShippoRequest = NextApiRequest & {
  body:
    | { type: ShippoCommand.VALIDATE_ADDRESS; address?: ShippoAddress }
    | {
        type: ShippoCommand.CREATE_SHIPMENT;
        addressFrom: ShippoAddress;
        addressTo: ShippoAddress;
        parcel: any;
      };
};

export type ShippoAddressResponse = {
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
};

export type ShippoAddress = {
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
};

export type ShippoParcel = {
  length: number;
  width: number;
  height: number;
  distance_unit: 'cm' | 'in' | 'ft' | 'mm' | 'm' | 'yd';
  weight: number;
  mass_unit: 'lb' | 'oz' | 'kg' | 'g';
};

export type ShippoShipmentResponse = {
  carrier_accounts?: string[];
  object_created?: string;
  object_updated?: string;
  object_id?: string;
  object_owner?: string;
  status?: string;
  address_from: object;
  address_to: object;
  parcels?: object[];
  shipment_date?: string;
  address_return?: object;
  alternate_address_to?: unknown;
  customs_declaration?: unknown;
  extra?: object;
  rates?: {
    object_created?: string;
    object_id?: string;
    object_owner?: string;
    shipment?: string;
    attributes?: string[];
    amount?: string;
    currency?: string;
    amount_local?: string;
    currency_local?: string;
    provider?: string;
    provider_image_75?: string;
    provider_image_200?: string;
    servicelevel?: {
      name?: string;
      token?: string;
      terms?: string;
      extended_token?: string;
      parent_servicelevel?: unknown;
    };
    estimated_days?: number;
    arrives_by?: string;
    duration_terms?: string;
    messages?: [];
    carrier_account?: string;
    test?: boolean;
    zone?: string;
    included_insurance_price?: string;
  }[];
  messages?: {
    source?: string;
    text?: string;
    type?: string;
  }[];
  metadata?: string;
  test?: boolean;
  order?: unknown;
};

const DEFAULT_FROM_ADDRESS: ShippoAddress = {
  name: 'Lilian Schimmel',
  company: 'Ethereal Sun Designs',
  street1: '23401 Seneca St',
  city: 'Oak Park',
  state: 'MI',
  zip: '48237',
  country: 'US',
  phone: '248-918-3854'
};

const DEFAULT_PARCEL: ShippoParcel = {
  length: 9,
  width: 6,
  height: 2,
  distance_unit: 'in',
  weight: 1,
  mass_unit: 'oz'
};

export const shippoAPI = axios.create({
  baseURL: 'https://api.goshippo.com/v1/',
  headers: {
    Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`
  }
});

const handler = async (req: ShippoRequest, res: NextApiResponse) => {
  switch (req.body.type) {
    case ShippoCommand.VALIDATE_ADDRESS: {
      const shippoRes = await validateAddress(req.body.address!);
      res.status(shippoRes.status).send(shippoRes.data);
      break;
    }
    case ShippoCommand.CREATE_SHIPMENT: {
      const shippoRes = await createShipment(
        req.body.addressFrom || DEFAULT_FROM_ADDRESS,
        req.body.addressTo,
        req.body.parcel || DEFAULT_PARCEL
      );
      res.status(shippoRes.status).send(shippoRes.data);
      break;
    }
    default:
      console.error('Invalid Shippo command: ', req.body.type);
      res
        .status(400)
        .send({ message: `Invalid Shippo command: ${req.body.type}` });
  }
};

const validateAddress = async (addressData: ShippoAddress) => {
  return await shippoAPI.post('addresses', {
    ...addressData,
    validate: true
  });
};

const createShipment = async (
  addressFrom: ShippoAddress,
  addressTo: ShippoAddress,
  parcel: ShippoParcel
) => {
  return await shippoAPI.post<ShippoShipmentResponse>('shipments', {
    address_from: addressFrom,
    address_to: addressTo,
    parcels: [parcel],
    async: false
  });
};

export default handler;
