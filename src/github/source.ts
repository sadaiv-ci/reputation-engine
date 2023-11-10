import jwt from 'jsonwebtoken'
import { Octokit } from "octokit";
import { getUserFromWallet } from '../helper/firebase';
import { extract } from './extract';

const getToken = async (installationId: number) => {
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY ?? ''
  const appId = process.env.GITHUB_APP_ID ?? ''

  const generateJwtToken = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = currentTime + (10 * 60); // 10 minutes expiration time

    const payload = {
      iat: currentTime,
      exp: expirationTime,
      iss: appId,
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256'
    });

    return token;
  };

  const jwtToken = generateJwtToken();

  // Use the token to get an installation access token
  const { data } = await (new Octokit()).rest.apps.createInstallationAccessToken({
    installation_id: installationId,
    headers: {
      authorization: `Bearer ${jwtToken}`,
    },
  });
  return data.token;
}

export const getUserDetails = async (scw: string) => {
  const installationId = await getUserFromWallet(scw)

  if(!installationId) return;

  const octokit = new Octokit({
    auth: await getToken(parseInt(installationId)) // personal access token of user.
  })

  // console.log(await octokit.rest.users.getAuthenticated())
  const extracts = await extract(octokit)

  return extracts
}
