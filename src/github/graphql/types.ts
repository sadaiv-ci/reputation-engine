export type TotalCount = {
  totalCount: number
}

export type Nodes<T> = {
  nodes: T[]
}

export type PushAndUpdatedAt = {
  pushedAt: string
  updatedAt: string
}

export type Commit = {
  defaultBranchRef: {
    target: {
      history: TotalCount
    }
  }
}

export type OwnerDetailsType = {
  viewer: {
    owner: {
      nodes: [{
        owner: {
          id: string,
          login: string
        }
      }]
    }
  }
}

export type Language = {
  name: string,
  primaryLanguage: {
    name: string
  }
  languages: {
    totalCount: number,
    nodes: { name: string }[]
  }
}

export type LanguagesRepo = {
  totalCount: number,
  nodes: Language[]
}

export type Contribution = {
  date: string,
  contributionCount: number
}

export type ContributionDays = {
  contributionDays: Contribution[]
}

export type Consistency = {
  contributionCalendar: {
    totalContributions: number,
    weeks: ContributionDays[]
  }
}

export type NoOfReposAndYearsOfExperienceResponseType = {
  user: {
    consistency: Consistency
  },
  viewer: {
    languagesPrivateRepos: LanguagesRepo,
    languagesPublicRepos: LanguagesRepo,
    publicFork: TotalCount,
    privateFork: TotalCount,
    publicRepos: TotalCount,
    privateRepos: TotalCount,
    forkRepoWithCommit: {
      totalCount: number,
      nodes: Commit[]
    },
    latestCommit: Nodes<PushAndUpdatedAt>,
    oldestCommit: Nodes<PushAndUpdatedAt>
  }
}
