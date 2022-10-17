import { Client, Environment, SearchCatalogObjectsResponse } from 'square';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SquareCommands } from '../../enums/SquareCommands';

interface squareRequest extends NextApiRequest {
  body: { type: SquareCommands; id?: string };
}

const handler = async (req: squareRequest, res: NextApiResponse) => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production,
  });

  let data;

  switch (req.body.type) {
    case 'GET_ALL_CATALOG':
      data = await getAllCatalog(client);
      res.status(200).send(data);
      break;
    case 'GET_ONE_CATALOG':
      if (req.body.id) {
        data = await getOneCatalog(client, req.body.id);
        res.status(200).send(data);
      } else {
        res.status(400).send('Invalid ID');
      }
      break;
    case 'GET_ONE_INVENTORY':
      if (req.body.id) {
        data = await getOneInventory(client, req.body.id);
        res.status(200).send(data);
      } else {
        res.status(400).send('Invalid ID');
      }
      break;
    default:
      res.status(404).send('Request not found');
  }
};

const covertToJSON = (data: any) => {
  return JSON.parse(
    JSON.stringify(
      data.result,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
    )
  );
};

const getAllCatalog = async (client: Client) => {
  const catalog = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true,
  });

  return covertToJSON(catalog);
};

const getOneCatalog = async (client: Client, id: string) => {
  let response;
  try {
    response = await client.catalogApi.retrieveCatalogObject(id, true);
    response = {
      ...response,
      inventory: await client.inventoryApi.retrieveInventoryCount(
        covertToJSON(response).object.itemData.variations[0].id
      ),
    };
  } catch (error) {
    response = error;
  }

  return covertToJSON(response);
};

const getOneInventory = async (client: Client, id: string) => {
  let response;
  try {
    response = await client.inventoryApi.retrieveInventoryCount(id);
  } catch (error) {
    response = error;
  }

  return covertToJSON(response);
};

export default handler;
