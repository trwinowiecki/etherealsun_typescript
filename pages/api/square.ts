import type { NextApiResponse } from 'next';
import {
  ApiResponse,
  Client,
  CreateCustomerResponse,
  Environment
} from 'square';

import AddressForm from '../../components/address-form';
import { SquareCommand } from '../../enums/square-commands';
import { UserCustom } from '../../types/supabase';

export type TakePaymentRequest = {
  token: string;
  amount: string;
  idempotencyKey: string;
  customer_id?: string;
  order_id?: string;
};

type BaseRequest = {
  idempotencyKey?: string;
};

export type SquareRequest = BaseRequest &
  (
    | { type: typeof SquareCommand.GET_ALL_CATALOG }
    | { type: typeof SquareCommand.GET_BATCH_CATALOG; ids: string[] }
    | { type: typeof SquareCommand.GET_ONE_INVENTORY; id: string }
    | { type: typeof SquareCommand.GET_OPTIONS_AND_ATTRIBUTES }
    | {
      type: typeof SquareCommand.SEARCH_FOR_USER;
      email: string;
      refId: string;
    }
    | { type: typeof SquareCommand.GET_CUSTOMER; id: string }
    | ({ type: typeof SquareCommand.TAKE_PAYMENT } & TakePaymentRequest)
    | { type: typeof SquareCommand.CREATE_CUSTOMER; customer: UserCustom }
    | {
      type: typeof SquareCommand.UPDATE_CUSTOMER;
      id: string;
      customer: UserCustom;
      address?: AddressForm;
    }
  );

const handler = async (req: { body: SquareRequest }, res: NextApiResponse) => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  switch (req.body.type) {
    case SquareCommand.GET_ALL_CATALOG: {
      const data = await getAllCatalog(client);
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.GET_BATCH_CATALOG: {
      const data = await getBatchCatalog(client, req.body.ids);
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.GET_ONE_INVENTORY: {
      const data = await getOneInventory(client, req.body.id);
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.SEARCH_FOR_USER: {
      let data = await searchForUserByRefId(client, req.body.refId);
      if (data.result.customers && data.result.customers.length > 0) {
        res.status(data.statusCode).send(data.result);
        break;
      }

      data = await searchForUserByEmail(client, req.body.email);
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.GET_OPTIONS_AND_ATTRIBUTES: {
      res.status(418).send('TODO');
      break;
    }
    case SquareCommand.GET_CUSTOMER: {
      const data = await getCustomer(client, req.body.id);
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.TAKE_PAYMENT: {
      const data = await takePayment(
        client,
        req.body.token,
        req.body.amount,
        req.body.idempotencyKey
      );
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.CREATE_CUSTOMER: {
      const data = await createCustomer(
        client,
        req.body.customer,
        req.body.idempotencyKey
      );
      res.status(data.statusCode).send(data.result);
      break;
    }
    case SquareCommand.UPDATE_CUSTOMER: {
      const data = await updateCustomer(
        client,
        req.body.id,
        req.body.customer,
        req.body.address
      );
      res.status(data.statusCode).send(data.result);
      break;
    }
    default: {
      res.status(404).send({ message: 'Request not found' });
    }
  }
};

export function convertToJSON<T>(data: ApiResponse<T>): ApiResponse<T> {
  return {
    ...data,
    result: JSON.parse(
      JSON.stringify(
        data.result,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value)
        // return everything else unchanged
      )
    )
  };
}

const getAllCatalog = async (client: Client) => {
  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  return convertToJSON(res);
};

const getBatchCatalog = async (client: Client, ids: string[]) => {
  const res = await client.catalogApi.batchRetrieveCatalogObjects({
    objectIds: ids,
    includeRelatedObjects: true
  });

  return convertToJSON(res);
};

const getOneInventory = async (client: Client, id: string) => {
  const res = await client.inventoryApi.retrieveInventoryCount(id);

  return convertToJSON(res);
};

const searchForUserByEmail = async (client: Client, email: string) => {
  const res = await client.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: {
          exact: email
        }
      }
    }
  });

  return convertToJSON(res);
};

const searchForUserByRefId = async (client: Client, id: string) => {
  const res = await client.customersApi.searchCustomers({
    query: {
      filter: {
        referenceId: {
          exact: id
        }
      }
    }
  });

  return convertToJSON(res);
};

const getCustomer = async (client: Client, id: string) => {
  const res = await client.customersApi.retrieveCustomer(id);

  return convertToJSON(res);
};

const takePayment = async (
  client: Client,
  token: string,
  amount: string,
  idempotencyKey: string
) => {
  const res = await client.paymentsApi.createPayment({
    sourceId: token,
    idempotencyKey,
    amountMoney: {
      amount: BigInt(parseInt(amount) * 100),
      currency: 'USD'
    },
    locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
    autocomplete: true
  });
  return convertToJSON(res);
};

const createCustomer = async (
  client: Client,
  customer: UserCustom,
  idempotencyKey?: string
): Promise<ApiResponse<CreateCustomerResponse>> => {
  const res = await client.customersApi.createCustomer({
    givenName: customer.first_name || '',
    familyName: customer.last_name || '',
    emailAddress: customer.email || '',
    phoneNumber: customer.phone || '',
    referenceId: customer.id,
    idempotencyKey
  });
  return convertToJSON(res);
};

const updateCustomer = async (
  client: Client,
  id: string,
  customer: UserCustom,
  address?: AddressForm
): Promise<ApiResponse<CreateCustomerResponse>> => {
  const res = await client.customersApi.updateCustomer(id, {
    givenName: customer.first_name || '',
    familyName: customer.last_name || '',
    emailAddress: customer.email || '',
    phoneNumber: customer.phone || '',
    referenceId: customer.id,
    address
  });
  return convertToJSON(res);
};

export default handler;
