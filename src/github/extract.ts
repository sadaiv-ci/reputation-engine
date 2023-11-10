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
import { NoOfReposAndYearsOfExperience, OwnerDetails } from "./graphql/queries";
import { NoOfReposAndYearsOfExperienceResponseType, OwnerDetailsType } from "./graphql/types";
import { Source } from "../types";
import { computeReposAndExp } from "./compute";

// Extract details for computation from different APIs.
export const extract = async (oct: Octokit): Promise<Source> => {

  const ownerId = await extractOwnerDetails(oct)

  // Use promise to do all the query & send data to compute.
  const promises = [extractReposAndExp(oct, ownerId)]

  const response = await Promise.all(promises)

  const data: Source = { reputation: 0, credentials: [] }

  response.forEach((r) => {
    data.reputation += r.reputation
    data.credentials = [...data.credentials, ...r.credentials]
  })

  return data;
}

const extractReposAndExp = async (oct: Octokit, ownerId: string): Promise<Source> => {
  const query = NoOfReposAndYearsOfExperience;
  const response = await oct.graphql<NoOfReposAndYearsOfExperienceResponseType>({ query, ownerId })

  // Compute reputation score & Collect credentials from source.

  const data = await computeReposAndExp(response)

  return data
}

const extractOwnerDetails = async (oct: Octokit) => {
  const query = OwnerDetails;
  const response = await oct.graphql<OwnerDetailsType>(query)

  return response.viewer.owner.nodes[0].owner.id
}
