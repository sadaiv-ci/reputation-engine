import { calculateWeeksDifference, convertToReputationFloat, denominateAndScale, getYearDifference } from "../helper/maths";
import { Credential, Source } from "../types";
import { Language, NoOfReposAndYearsOfExperienceResponseType } from "./graphql/types";

import languages from './languages.json'
interface LanguageData {
  importance: number;
  difficulty: number;
}

interface Languages {
  [key: string]: LanguageData;
}

// 0 to 10 scale.
const weights = [5, 3, 6, 8]

export const computeReposAndExp = async (data: NoOfReposAndYearsOfExperienceResponseType): Promise<Source> => {
  // Calculating Reputation.
  const noOfReposScore = (): Source => {
    const validForks = data.viewer.forkRepoWithCommit.nodes
      .filter((v) => v.defaultBranchRef.target.history.totalCount > 0).length

    // Total public repos including forks.
    const publicRepos = (data.viewer.publicRepos.totalCount) + (data.viewer.publicFork.totalCount)

    const ownRepos = (data.viewer.publicRepos.totalCount)

    const response = convertToReputationFloat((ownRepos + validForks * Math.min((validForks), 0.5)) / publicRepos)

    return {
      reputation: response,
      credentials: [{
        name: "Number of Public Repositories",
        description: "Total number of public repositories owned by the developer",
        value: data.viewer.publicRepos.totalCount,
        type: 'PublicRepository'
      }, {
        name: "Number of Valid Fork Repositories",
        description: "Total number of fork repositories with atleast one commit by developer",
        value: validForks,
        type: 'ValidForkRepository'
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
        value: exp,
        type: "YearsOfExperience"
      }]
    }
  }

  const computePortfolioScore = (): Source => {

    let langsToRepoMap: Map<string, number> = new Map()

    const totalRepos = data.viewer.languagesPublicRepos.totalCount + data.viewer.languagesPrivateRepos.totalCount

    // Compute Languages Score & Credentials list.
    data.viewer.languagesPublicRepos.nodes.forEach((e: Language) => {
      if (e.primaryLanguage != null) {
        const langs = [e.primaryLanguage.name]
        // e.languages.nodes.forEach((i) => {
        //   if (!langs.includes(i.name)) {
        //     langs.push(i.name)
        //   }
        // })

        langs.forEach((i) => {
          if (langsToRepoMap.has(i)) {
            langsToRepoMap.set(i, langsToRepoMap.get(i)! + 1)
          } else {
            langsToRepoMap.set(i, 1)
          }
        })
      }
    })
    data.viewer.languagesPrivateRepos.nodes.forEach((e: Language) => {
      if (e.primaryLanguage != null) {
        const langs = [e.primaryLanguage.name]
        // Commented to not consider the secondary languages.
        // e.languages.nodes.forEach((i) => {
        //   if (!langs.includes(i.name)) {
        //     langs.push(i.name)
        //   }
        // })

        langs.forEach((i) => {
          if (langsToRepoMap.has(i)) {
            langsToRepoMap.set(i, langsToRepoMap.get(i)! + 1)
          } else {
            langsToRepoMap.set(i, 1)
          }
        })
      }
    })


    let reputationScore = 0
    let totalBase = 0
    const langs: Languages = JSON.parse(JSON.stringify(languages))

    // Issue credentials for experience in different languages.
    langsToRepoMap.forEach((count, lang) => {
      if (Object.keys(langs).includes(lang.toLowerCase())) {
        totalBase += (count)
        reputationScore += (count * ((langs[lang.toLowerCase()].difficulty + langs[lang.toLowerCase()].importance) / 2))
      }
    })

    // Change totalRepos to totalBase for considering secondary languages.
    reputationScore = convertToReputationFloat(reputationScore / totalRepos)

    const creds: Credential[] = []
    langsToRepoMap.forEach((v, k) => {
      creds.push({
        name: `${k} projects`,
        description: `Number of projects that uses ${k} programmming language.`,
        value: v,
        type: 'LanguageProjects',
        properties: {
          language: k.toLowerCase()
        }
      })
    })
    return {
      reputation: reputationScore,
      credentials: creds
    }
  }

  const computeConsistency = (): Source => {

    const weeks = data.user.consistency.contributionCalendar.weeks

    let totalNumerator = 0

    weeks.forEach((i) => {
      i.contributionDays.forEach((d) => {
        const date = Date.parse(d.date)
        const weekDifference = calculateWeeksDifference(Date.now() - date)

        totalNumerator += (d.contributionCount * Math.exp(-1 * weekDifference))
      })
    })

    const reputationScore = convertToReputationFloat(totalNumerator / weeks.length)

    return {
      reputation: reputationScore,
      credentials: [{
        name: "Consistency Score",
        description: "Developer code activity score on GitHub.",
        value: reputationScore,
        type: 'Consistency'
      }]
    }
  }

  const listOfMethods = [noOfReposScore(), yearsOfExperience(), computePortfolioScore(), computeConsistency()]

  const result: Source = { reputation: 0, credentials: [] }

  listOfMethods.map((item, index) => { result.reputation += (item.reputation * weights[index]), result.credentials = [...result.credentials, ...item.credentials] })

  result.reputation = denominateAndScale(result.reputation, listOfMethods.length)

  return result
}

