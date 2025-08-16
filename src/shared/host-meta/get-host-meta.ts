import { getConfiguration } from '../configuration/get-configuration';
import { debug } from '../debug';
import { displayToast } from '../dom/display-toast';
import { matchUrl } from '../match-url';
import { DEFAULT_HOSTS } from './default-hosts';
import { AdditionalHostMeta, HostMeta, PredefinedHostMeta } from './types';

export function getHostMeta(
  host: string,
  role: string,
  filter?: (meta: HostMeta) => boolean,
  multiple?: false,
): Promise<HostMeta | undefined>;
export function getHostMeta(
  host: string,
  role: string,
  filter: (meta: HostMeta) => boolean,
  multiple: true,
): Promise<HostMeta[]>;

export async function getHostMeta(
  host: string,
  role: string,
  filter: (meta: HostMeta) => boolean = (): boolean => true,
  multiple?: boolean,
): Promise<HostMeta[] | HostMeta | undefined> {
  const disabledHosts = await getConfiguration('disabledParsers');
  const additionalHosts = await getConfiguration('additionalHosts');
  const additionalMeta = await getConfiguration('additionalMeta');
  const hostsMeta: HostMeta[] = DEFAULT_HOSTS;

  const isPredefined = (meta: HostMeta): meta is PredefinedHostMeta => 'id' in meta;

  debug(
    `[${role}] getHostMeta called with host: ${host}`,
    'filter:',
    filter,
    'multiple:',
    multiple,
  );

  if (!host?.length) {
    debug(`[${role}] getHostMeta called with empty host string`);

    return multiple ? [] : undefined;
  }

  try {
    const meta = JSON.parse(additionalMeta?.length ? additionalMeta : '[]') as HostMeta[];

    debug(`[${role}] Loaded additional meta:`, meta);

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
    console.error(`[${role}] Failed to parse additional meta:`, e);

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

      debug(`[${role}] Adding additional host:`, additionalHostObject);
      hostsMeta.push(additionalHostObject);
    });

  const hostFilter = (meta: HostMeta): boolean => {
    const isMatch = (matchPattern: string): boolean => {
      if (isPredefined(meta) && meta.optOut && disabledHosts.includes(meta.id)) {
        return false;
      }

      return matchUrl(matchPattern, host);
    };

    return Array.isArray(meta.host) ? meta.host.some(isMatch) : isMatch(meta.host);
  };

  const enabledHosts = hostsMeta.filter(hostFilter);
  const result = multiple ? enabledHosts.filter(filter) : enabledHosts.find(filter);

  debug(`[${role}] getHostMeta result:`, { host, result });

  return result;
}
