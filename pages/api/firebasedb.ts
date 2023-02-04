/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
/* eslint-disable no-case-declarations */
import { onValue, ref } from 'firebase/database';
import type { NextApiRequest, NextApiResponse } from 'next';

import { auth, database } from '../../utils/firebase/firebase';

export enum FirebaseCommand {
  UPDATE_USER_ID = 'UPDATE_USER_ID',
  GET_USER_ID = 'GET_USER_ID'
}

interface Data {}

interface FirebaseRequest extends NextApiRequest {
  body: {
    type: FirebaseCommand;
    firebaseUser?: string;
    squareUser?: string;
  };
}

export default async function handler(
  req: FirebaseRequest,
  res: NextApiResponse<Data>
) {
  let data;

  switch (req.body.type) {
    case FirebaseCommand.GET_USER_ID:
      const userId: string | null =
        auth.currentUser?.uid ?? req.body.firebaseUser ?? null;
      console.log(auth.currentUser?.uid);
      console.log(req.body.firebaseUser);
      console.log(userId);

      if (userId) {
        try {
          onValue(
            ref(database, `users/${userId}`),
            snapshot => {
              console.log(snapshot);
              if (snapshot.val() && snapshot.val().squareId) {
                res.status(200).send(snapshot.val().squareId);
              } else {
                res
                  .status(400)
                  .send({ message: 'No associated Square ID stored' });
              }
            },
            { onlyOnce: true }
          );
        } catch (error) {
          res.status(400).send(error);
        }
      } else {
        res.status(400).send({ message: 'User not set' });
      }
      break;
    case FirebaseCommand.UPDATE_USER_ID:
      break;
    default:
      res.status(404).send({ message: 'Request not found' });
  }
}
