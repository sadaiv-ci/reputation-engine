/*
  Sadaiv Reputation Engine: For Developers
  Starting Day: 1 November 2023
  Author: Tushar Ojha

  Notes: Starting with the reputation engine, the long term aim of the
  project is evolve as a robust sytem to compute work and provide clear,
  transparent, reliable metric of work done & it's impact.
*/

console.log("Sadaiv Reputation Engine: Server Start!")

import dotenv from 'dotenv'
import engine from './engine'
import id from './issuer'
import { initFirebase } from './helper/firebase'

dotenv.config();
initFirebase()
id.setup()
engine.start()
