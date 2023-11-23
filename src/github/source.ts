import jwt from 'jsonwebtoken'
import { Octokit } from "octokit";
import { getUserFromWallet } from '../helper/firebase';
import { extract } from './extract';
import { APP_ID, GITHUB_APP_PRIVATE_KEY } from '../env';
import { Source } from '../types';

const getToken = async (installationId: number) => {

  const generateJwtToken = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = currentTime + (10 * 60); // 10 minutes expiration time

    const payload = {
      iat: currentTime,
      exp: expirationTime,
      iss: APP_ID,
    };

    const token = jwt.sign(payload, GITHUB_APP_PRIVATE_KEY, {
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

export const getUserDetails = async (scw: string): Promise<{ extracts: Source, did: string }> => {
  const { installationId, did } = await getUserFromWallet(scw)

  if (!installationId || !did) throw Error("Sadaiv CI is not installed by the user.");

  const octokit = new Octokit({
    auth: await getToken(parseInt(installationId)) // personal access token of user.
  })

  const extracts = await extract(octokit)

  return { extracts, did }
}
