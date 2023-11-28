import express, { Express, Request, Response } from 'express';
import { getUserDetails } from './github/source';
import { issueCredentials } from './issuer';
import { PORT } from './env';
import { getSchemaFromCredentialType } from './issuer/schemas';
import { CredentialType } from './types';
import { getUserDocRef, updateReputationAndCredentials } from './helper/firebase';

import cors from 'cors'

const app: Express = express();

const start = () => {

  app.use(cors())

  app.use((req, _, next) => {
    console.log(`⚡️ [server]: ${req.method} query on ${req.path}`)
    next()
  })

  const corsOptions = {
    origin: [`http://localhost:3000`, `http://localhost:${PORT}`, 'http://explorer.sadaiv.io'],
    methods: 'GET',
    optionsSuccessStatus: 204,
  };

  app.get('/schemas/:type/:file', async (req: Request, res: Response) => {
    const type = req.params.type as CredentialType;
    const file = req.params.file;

    const isLd = file.includes('.jsonld')

    const response = getSchemaFromCredentialType(type, isLd)

    if (!response) {
      res.status(404).send({ message: "Cannot find the schema." })
      return;
    }

    res.json(response)
  })

  app.get('/', cors(corsOptions), async (req: Request, res: Response) => {
    const { scw } = req.query

    if (!scw || scw?.toString().length < 10) {
      res.status(400).send({ message: "Invalid wallet address" })
      return;
    }
    try {
      const { extracts: creds, did } = await getUserDetails(scw.toString())

      if (!creds || creds.credentials.length < 3) {
        res.status(400).send({ message: "Unable to issue credentials to the developer" })
        return;
      }

      const response = await issueCredentials(creds, did)

      // Store credentails on users' firebase.
      const userRef = await getUserDocRef(scw.toString())

      if (userRef) {
        const isStored = await updateReputationAndCredentials(userRef, creds.reputation, Date.now(), response.creds)

        if (isStored) {
          res.status(200).send({
            message: "Credentials Stored Successfully.",
            reputation: {
              score: creds.reputation,
              totalCreds: response.creds.length
            }
          })
        } else {
          res.status(500).send({
            message: "Unable to store credentials for the developer"
          })
          return;
        }

      } else {
        res.status(500).send({ message: "Unable to find the register developer. Make sure to create a profile first." })
        return;
      }
    } catch (e: any) {
      console.log(e)
      res.status(500).send({
        message: e?.message ?? 'Something went wrong.'
      })
    }

  });

  app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
  });
}

export default { start }