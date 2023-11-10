/*
  Sadaiv Reputation Engine: For Developers
  Starting Day: 1 November 2023
  Author: Tushar Ojha

  Notes: Starting with the reputation engine, the long term aim of the
  project is evolve as a robust sytem to compute work and provide clear,
  transparent, reliable metric of work done & it's impact.
*/

console.log("Sadaiv Reputation Engine: Server Start!")

import engine from './engine'
import { initFirebase } from './helper/firebase'

initFirebase()
engine.start()
