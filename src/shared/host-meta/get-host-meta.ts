import { getConfiguration } from '../configuration/get-configuration';
import { DEFAULT_HOSTS } from './default-hosts';
import { HostMeta } from './types';

export function getHostMeta(
  host: string,
  filter?: (meta: HostMeta) => boolean,
  multiple?: false,
): Promise<HostMeta | undefined>;
export function getHostMeta(
  host: string,
  filter: (meta: HostMeta) => boolean,
  multiple: true,
): Promise<HostMeta[]>;

export async function getHostMeta(
  host: string,
  filter: (meta: HostMeta) => boolean = (): boolean => true,
  multiple?: boolean,
): Promise<HostMeta[] | HostMeta | undefined> {
  const disabledHosts = await getConfiguration('disabledParsers', true);

  const hostsMeta = DEFAULT_HOSTS; // @todo Merge with custom defined hosts if any

  const hostFilter = (meta: HostMeta): boolean => {
    const matchUrl = (matchPattern: string): boolean => {
      if (meta.optOut && disabledHosts.includes(meta.id)) {
        return false;
      }

      if (matchPattern === '<all_urls>') {
        return true;
      }

      const [patternSchema, patternUrl] = matchPattern.split('://', 2);
      const [patternHost, patternPath] = patternUrl.split(/\/(.*)/, 2);
      const [hostSchema, hostUrl] = host.split('://', 2);
      const [hostHost, hostPath] = hostUrl.split(/\/(.*)/, 2);

      if (patternSchema === '*' && !['http', 'https'].includes(hostSchema)) {
        return false;
      }

      if (patternSchema !== '*' && patternSchema !== hostSchema) {
        return false;
      }

      const hostRegex = new RegExp(`^${patternHost.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
      const pathRegex = new RegExp(`^${patternPath.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);

      if (!hostHost.match(hostRegex)) {
        return false;
      }

      if (!hostPath.match(pathRegex)) {
        return false;
      }

      return true;
    };

    return Array.isArray(meta.host) ? meta.host.some(matchUrl) : matchUrl(meta.host);
  };

  const enabledHosts = hostsMeta.filter(hostFilter);

  return Promise.resolve(multiple ? enabledHosts.filter(filter) : enabledHosts.find(filter));
}
