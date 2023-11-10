
export const OwnerDetails = `
  query {
    viewer {
      id
      owner: repositories (first: 1, isFork: false){
        nodes {
          owner {
            id
          }
        }
      }
    }
  }
`

// Query required to calculate score for: Number of Repos & Calculate Years of Experience.
export const NoOfReposAndYearsOfExperience = `
  query ($ownerId: ID!) {
    viewer {
      id
      owner: repositories (first: 1){
        nodes {
          owner {
            id
          }
        }
      }
      publicFork: repositories(privacy: PUBLIC, isFork: true) {
        totalCount
      }
      privateFork: repositories(privacy: PRIVATE, isFork: true) {
        totalCount
      }
      publicRepos: repositories(privacy: PUBLIC) {
        totalCount
      }
      privateRepos: repositories(privacy: PRIVATE) {
        totalCount
      }
      forkRepoWithCommit: repositories(first: 100, isFork: true, privacy: PUBLIC) {
        totalCount
        nodes {
          defaultBranchRef {
            target {
              ... on Commit { 
                history(first: 1, author: {id: $ownerId}) {
                  totalCount
                }
              }
            }
          }
        }
      }
      latestCommit: repositories(first: 1, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          pushedAt
          updatedAt
        }
      }
      oldestCommit: repositories(last: 1, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          pushedAt
          updatedAt
        }
      }
    }
  }
`

export const RepositoryLanguages = `
`
