/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { CancelToken } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

interface GeoRequest extends NextApiRequest {
  body: { query: string; cancelToken: CancelToken };
}

export default async function handler(req: GeoRequest, res: NextApiResponse) {
  const { query, cancelToken } = req.body;
  console.log(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${process.env.GEOAPIFY_API_KEY}`
  );
  try {
    const data = await axios({
      method: 'GET',
      url: `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${process.env.GEOAPIFY_API_KEY}`,
      cancelToken
    });
    res.status(200).send(data);
  } catch (error) {
    if (!axios.isCancel(error)) {
      res.status(400).send(error);
    }
  }
}
