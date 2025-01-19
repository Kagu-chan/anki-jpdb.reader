import { getConfiguration } from '../configuration/get-configuration';
import { displayToast } from '../dom/display-toast';
import { JPDBEndpoints, JPDBErrorResponse, JPDBRequestOptions } from './api.types';

export const request = async <Key extends keyof JPDBEndpoints>(
  action: Key,
  params: JPDBEndpoints[Key][0] | undefined,
  options?: JPDBRequestOptions,
): Promise<JPDBEndpoints[Key][1]> => {
  const apiToken = options?.apiToken || (await getConfiguration('jpdbApiToken', false));

  if (!apiToken) {
    displayToast('error', 'API Token is not set');

    throw new Error('API Token is not set');
  }

  const usedUrl = new URL(`https://jpdb.io/api/v1/${action}`);
  const response = await fetch(usedUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
    },
    body: params ? JSON.stringify(params) : undefined,
  });

  const responseObject = (await response.json()) as JPDBErrorResponse | JPDBEndpoints[Key][1];

  if ('error_message' in (responseObject as JPDBErrorResponse)) {
    throw new Error((responseObject as JPDBErrorResponse).error_message);
  }

  return responseObject as JPDBEndpoints[Key][1];
};
