import type { NextApiResponse } from 'next';
import { Client, Environment } from 'square';

import { SquareCommand } from '../../enums/SquareCommands';

export type SquareRequest =
  | { type: SquareCommand.GET_ALL_CATALOG }
  | { type: SquareCommand.GET_BATCH_CATALOG; ids: string[] }
  | { type: SquareCommand.GET_ONE_CATALOG; id: string }
  | { type: SquareCommand.GET_ONE_INVENTORY; id: string }
  | { type: SquareCommand.GET_OPTIONS_AND_ATTRIBUTES }
  | { type: SquareCommand.SEARCH_FOR_USER; email: string }
  | { type: SquareCommand.GET_CUSTOMER; id: string };

const locationId = 'LQC4A379XHYGD';
const merchantId = 'MLQSF7HKN6S30';

const handler = async (req: { body: SquareRequest }, res: NextApiResponse) => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  let data;

  switch (req.body.type) {
    case SquareCommand.GET_ALL_CATALOG:
      data = await getAllCatalog(client);
      res.status(200).send(data);
      break;
    case SquareCommand.GET_BATCH_CATALOG:
      data = await getBatchCatalog(client, req.body.ids);
      res.status(200).send(data);
      break;
    case SquareCommand.GET_ONE_CATALOG:
      data = await getOneCatalog(client, req.body.id);
      res.status(200).send(data);
      break;
    case SquareCommand.GET_ONE_INVENTORY:
      data = await getOneInventory(client, req.body.id);
      res.status(200).send(data);
      break;
    case SquareCommand.SEARCH_FOR_USER:
      data = await searchForUser(client, req.body.email);
      res.status(200).send(data);
      break;
    case SquareCommand.GET_OPTIONS_AND_ATTRIBUTES:
      res.status(418).send('TODO');
      break;
    case SquareCommand.GET_CUSTOMER:
      data = await getCustomer(client, req.body.id);
      res.status(200).send(data);
      break;
    default:
      res.status(404).send({ message: 'Request not found' });
  }
};

export function convertToJSON(data: any) {
  return JSON.parse(
    JSON.stringify(
      data.result,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value)
      // return everything else unchanged
    )
  );
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

const getOneCatalog = async (client: Client, id: string) => {
  let res;
  try {
    res = await client.catalogApi.retrieveCatalogObject(id, true);
    res = {
      ...res,
      inventory: await client.inventoryApi.retrieveInventoryCount(
        convertToJSON(res).object.itemData.variations[0].id
      )
    };
  } catch (error) {
    res = error;
  }

  return convertToJSON(res);
};

const getOneInventory = async (client: Client, id: string) => {
  let res;
  try {
    res = await client.inventoryApi.retrieveInventoryCount(id);
  } catch (error) {
    res = error;
  }

  return convertToJSON(res);
};

const searchForUser = async (client: Client, email: string) => {
  let res;
  try {
    res = await client.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: {
            exact: email
          }
        }
      }
    });
  } catch (error) {
    res = error;
  }

  return convertToJSON(res);
};

const getCustomer = async (client: Client, id: string) => {
  let res;
  try {
    res = await client.customersApi.retrieveCustomer(id);
  } catch (error) {
    res = error;
  }

  return convertToJSON(res);
};

export default handler;
