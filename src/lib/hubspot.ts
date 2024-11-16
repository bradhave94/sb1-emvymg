import { Client } from '@hubspot/api-client';

export const createHubSpotClient = (accessToken: string) => {
  return new Client({ accessToken });
};