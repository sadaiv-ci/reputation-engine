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

