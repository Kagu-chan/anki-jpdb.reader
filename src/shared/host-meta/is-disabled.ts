import { getHostMeta } from './get-host-meta';

export const isDisabled = async (host: string): Promise<boolean> => {
  const meta = await getHostMeta(host, 'isDisabled', ({ host }) => host !== '<all_urls>');

  if (!meta) {
    return false;
  }

  if (meta.disabled) {
    return true;
  }

  return meta.auto;
};
