import { getConfiguration } from '../configuration/get-configuration';
import { displayToast } from '../dom/display-toast';
import { AnkiEndpoints, AnkiRequestOptions } from './api.types';

export const request = async <Key extends keyof AnkiEndpoints>(
  action: Key,
  params: AnkiEndpoints[Key][0] | undefined,
  options?: AnkiRequestOptions,
): Promise<AnkiEndpoints[Key][1]> => {
  const ankiUrl = options?.ankiConnectUrl || (await getConfiguration('ankiUrl', false));

  if (!ankiUrl) {
    displayToast('error', 'Anki URL is not set');

    throw new Error('Anki URL is not set');
  }

  const usedUrl = new URL(ankiUrl.replace(/127\.0\.0\.1/, 'http://localhost'));
  const response = await fetch(usedUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      version: 6,
      params,
    }),
  });

  const responseObject = (await response.json()) as
    | {
        error: string;
      }
    | {
        error: null;
        result: AnkiEndpoints[Key][1];
      };

  if ('error' in responseObject && responseObject.error !== null) {
    throw new Error(responseObject.error);
  }

  return responseObject.result;
};
