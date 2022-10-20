import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import { SquareCommands } from '../../enums/SquareCommands';

interface squareRequest extends NextApiRequest {
  body: { type: SquareCommands; id?: string; ids?: string[] };
}

const locationId = 'LQC4A379XHYGD';
const merchantId = 'MLQSF7HKN6S30';

const handler = async (req: squareRequest, res: NextApiResponse) => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
  });

  let data;

  switch (req.body.type) {
    case SquareCommands.GET_ALL_CATALOG:
      data = await getAllCatalog(client);
      res.status(200).send(data);
      break;
    case SquareCommands.GET_BATCH_CATALOG:
      if (req.body.ids) {
        data = await getBatchCatalog(client, req.body.ids);
        res.status(200).send(data);
      } else {
        res.status(400).send('No search IDs provided');
      }
      break;
    case SquareCommands.GET_ONE_CATALOG:
      if (req.body.id) {
        data = await getOneCatalog(client, req.body.id);
        res.status(200).send(data);
      } else {
        res.status(400).send('Invalid ID');
      }
      break;
    case SquareCommands.GET_ONE_INVENTORY:
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
  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  return covertToJSON(res);
};

const getBatchCatalog = async (client: Client, ids: string[]) => {
  const res = await client.catalogApi.batchRetrieveCatalogObjects({
    objectIds: ids,
    includeRelatedObjects: true
  });

  return covertToJSON(res);
};

const getOneCatalog = async (client: Client, id: string) => {
  let res;
  try {
    res = await client.catalogApi.retrieveCatalogObject(id, true);
    res = {
      ...res,
      inventory: await client.inventoryApi.retrieveInventoryCount(
        covertToJSON(res).object.itemData.variations[0].id
      )
    };
  } catch (error) {
    res = error;
  }

  return covertToJSON(res);
};

const getOneInventory = async (client: Client, id: string) => {
  let res;
  try {
    res = await client.inventoryApi.retrieveInventoryCount(id);
  } catch (error) {
    res = error;
  }

  return covertToJSON(res);
};

export default handler;
