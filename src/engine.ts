import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getUserDetails } from './github/source';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

const start = () => {
  app.get('/', async (req: Request, res: Response) => {

    const { scw } = req.query

    if (!scw || scw?.toString().length < 10) {
      res.status(400).send({ message: "Invalid wallet address" })
      return;
    }

    await getUserDetails(scw.toString()).then((r) => {

      res.send(r)
      // res.send(`Reputation: ${r?.reputation}`);
    })
  });

  app.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
  });
}

export default { start }