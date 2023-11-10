import { convertToReputationFloat, getYearDifference } from "../helper/maths";
import { REPUTATION_DECIMAL_POINTS, Source } from "../types";
import { NoOfReposAndYearsOfExperienceResponseType } from "./graphql/types";

export const computeReposAndExp = async (data: NoOfReposAndYearsOfExperienceResponseType): Promise<Source> => {
  // Calculating Reputation.
  const noOfReposScore = (): Source => {
    const validForks = data.viewer.forkRepoWithCommit.nodes
      .filter((v) => v.defaultBranchRef.target.history.totalCount > 0).length

    // Total public repos including forks.
    const publicRepos = (data.viewer.publicRepos.totalCount) + (data.viewer.publicFork.totalCount)

    const ownRepos = (data.viewer.publicRepos.totalCount)

    const response = convertToReputationFloat((ownRepos + validForks * Math.min((validForks), 0.5))  / publicRepos)

    return {
      reputation: response,
      credentials: [{
        name: "Number of Public Repositories",
        description: "Total number of public repositories owned by the developer",
        value: data.viewer.publicRepos.totalCount
      }, {
        name: "Number of Valid Fork Repositories",
        description: "Total number of fork repositories with atleast one commit by developer",
        value: validForks
      }]
    }
  }

  const yearsOfExperience = (): Source => {
    const mostRecentCommit = data.viewer.latestCommit.nodes[0].pushedAt
    const oldestCommit = data.viewer.oldestCommit.nodes[0].pushedAt

    const exp = getYearDifference(oldestCommit, mostRecentCommit)

    // The base is 2008 when github platform started.
    const totalBaseFromGitHub = new Date().getFullYear() - 2008

    const response = convertToReputationFloat(exp / totalBaseFromGitHub)

    return {
      reputation: response, credentials: [{
        name: "Years of Experience",
        description: "Number of years of experience developer have been on GitHub.",
        value: exp
      }]
    }
  }


  const listOfMethods = [noOfReposScore(), yearsOfExperience()]

  const result: Source = { reputation: 0, credentials: [] }

  listOfMethods.map((item) => { result.reputation += item.reputation, result.credentials = [...result.credentials, ...item.credentials] })

  return result
}