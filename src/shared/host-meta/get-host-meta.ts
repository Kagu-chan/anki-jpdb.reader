import { getConfiguration } from '../configuration/get-configuration';
import { debug } from '../debug';
import { displayToast } from '../dom/display-toast';
import { DEFAULT_HOSTS } from './default-hosts';
import { AdditionalHostMeta, HostMeta, PredefinedHostMeta } from './types';

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
  const additionalHosts = await getConfiguration('additionalHosts', true);
  const additionalMeta = await getConfiguration('additionalMeta', true);
  const hostsMeta: HostMeta[] = DEFAULT_HOSTS;

  const isPredefined = (meta: HostMeta): meta is PredefinedHostMeta => 'id' in meta;

  debug('getHostMeta called with host:', host, 'filter:', filter, 'multiple:', multiple);

  if (!host?.length) {
    debug('getHostMeta called with empty host string');

    return multiple ? [] : undefined;
  }

  try {
    const meta = JSON.parse(additionalMeta?.length ? additionalMeta : '[]') as HostMeta[];

    debug('Loaded additional meta:', meta);

    hostsMeta.push(
      ...meta.map(
        ({
          host,
          auto = true,
          allFrames = false,
          disabled,
          parse,
          filter,
          css,
          parseVisibleObserver,
          addedObserver,
          parserClass,
        }) => ({
          host,
          auto,
          allFrames,
          disabled,
          parse,
          filter,
          css,
          parseVisibleObserver,
          addedObserver,
          parserClass,
        }),
      ),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse additional meta:', e);

    displayToast(
      'error',
      'Failed to parse additional meta. Please check your configuration.',
      (e as Error).message,
    );
  }

  additionalHosts
    .trim()
    .replace(/\r\n?/g, ' ')
    .split(/[\s;,]/)
    .filter(Boolean)
    .forEach((host) => {
      const additionalHostObject: AdditionalHostMeta = {
        host,
        auto: true,
        allFrames: true,
        parse: 'body',
        parserClass: 'custom-parser',
      };

      debug('Adding additional host:', additionalHostObject);
      hostsMeta.push(additionalHostObject);
    });

  const hostFilter = (meta: HostMeta): boolean => {
    const matchUrl = (matchPattern: string): boolean => {
      if (isPredefined(meta) && meta.optOut && disabledHosts.includes(meta.id)) {
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
  const result = multiple ? enabledHosts.filter(filter) : enabledHosts.find(filter);

  debug('getHostMeta result:', { host, result });

  return result;
}
