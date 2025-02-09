import { JPDBEndpoints, JPDBRequestOptions } from './api.types';
import { requestByUrl } from './request-by-url';

export const request = async <Key extends keyof JPDBEndpoints>(
  action: Key,
  params: JPDBEndpoints[Key][0] | undefined,
  options?: JPDBRequestOptions,
): Promise<JPDBEndpoints[Key][1]> => {
  return await requestByUrl('https://jpdb.io/api/v1', action, params, options);
};
