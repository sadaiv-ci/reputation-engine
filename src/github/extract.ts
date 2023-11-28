// Extracts the information required for computing reputation score.

/*
  From GitHub APIs:

  1. Number of Repositories (Private & Public): Separate count for forks & own repos
  2. Date of most recent commit & the first commit
  3. No. of repositories for each programming language & tech stack (like flutter, react native, node, etc.)
  4. For each repository:
      - number of forks, watches, stars
      - readMe file present or not
      - project link present or not
      - number of external contributors
      - for each / random / recent commits: message, lines changed (execpt files lock files), language used
  5. Merged commits into others repository, data & logic same as personal repo 
  6. Consistency Score: No. of commits per week for last 52 weeks.

*/

import { Octokit } from "octokit";
import { ConsistencyScoreQuery, NoOfReposAndYearsOfExperience, OwnerDetails } from "./graphql/queries";
import { Consistency, NoOfReposAndYearsOfExperienceResponseType, OwnerDetailsType } from "./graphql/types";
import { Source } from "../types";
import { computeReposAndExp } from "./compute";
import { getOneYearAgoTimestamp, getTodayTimestamp } from "../helper/maths";

// Extract details for computation from different APIs.
export const extract = async (oct: Octokit): Promise<Source> => {

  const { ownerId, login } = await extractOwnerDetails(oct)

  // Use promise to do all the query & send data to compute.
  const promises = [extractReposAndExp(oct, ownerId, login)]

  const response = await Promise.all(promises)

  const data: Source = { reputation: 0, credentials: [] }

  response.forEach((r) => {
    data.reputation += r.reputation
    data.credentials = [...data.credentials, ...r.credentials]
  })

  return data;
}

const extractReposAndExp = async (oct: Octokit, ownerId: string, login: string): Promise<Source> => {
  const oneYearAgo = (getOneYearAgoTimestamp())
  const today = (getTodayTimestamp())
  const query = NoOfReposAndYearsOfExperience;

  try {
    const response = await oct.graphql<NoOfReposAndYearsOfExperienceResponseType>({ query, ownerId, oneYearAgo, today, login })

    // Compute reputation score & Collect credentials from source. ̰
    const data = await computeReposAndExp(response)

    return data
  } catch (e) {
    console.log('response', ((e as any).response))
    return {
      reputation: 0,
      credentials: []
    }
  }
}

const extractOwnerDetails = async (oct: Octokit) => {
  const query = OwnerDetails;
  const response = await oct.graphql<OwnerDetailsType>(query)
  if (!response.viewer) {
    // TODO: Reputation is Zero. Users account is freshly created.
    // Maybe we can set limit or time for account to be established.
    throw Error("User don't have a legit GitHub profile")
  }
  const owner = response.viewer.owner.nodes[0].owner
  return { login: owner.login, ownerId: owner.id }
}
