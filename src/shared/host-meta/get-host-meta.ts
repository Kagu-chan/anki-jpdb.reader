import { getConfiguration } from '../configuration/get-configuration';
import { debug } from '../debug';
import { displayToast } from '../dom/display-toast';
import { matchUrl } from '../match-url';
import { DEFAULT_HOSTS } from './default-hosts';
import {
  AdditionalHostMeta,
  FlatHostMeta,
  PredefinedHostMeta,
  SingleParserHostMeta,
} from './types';

/** Expands `MultiParserHostMeta` entries into one `SingleParserHostMeta` per `parsers` entry. */
function flattenPredefinedHosts(hosts: PredefinedHostMeta[]): SingleParserHostMeta[] {
  return hosts.flatMap((host) => {
    if (!('parsers' in host)) {
      return host;
    }

    const { parsers, ...base } = host;

    return parsers.map((parser) => ({ ...base, ...parser }));
  });
}

export function getHostMeta(
  host: string,
  role: string,
  filter?: (meta: FlatHostMeta) => boolean,
  multiple?: false,
): Promise<FlatHostMeta | undefined>;
export function getHostMeta(
  host: string,
  role: string,
  filter: (meta: FlatHostMeta) => boolean,
  multiple: true,
): Promise<FlatHostMeta[]>;

export async function getHostMeta(
  host: string,
  role: string,
  filter: (meta: FlatHostMeta) => boolean = (): boolean => true,
  multiple?: boolean,
): Promise<FlatHostMeta[] | FlatHostMeta | undefined> {
  const disabledHosts = await getConfiguration('disabledParsers');
  const additionalHosts = await getConfiguration('additionalHosts');
  const additionalMeta = await getConfiguration('additionalMeta');
  const hostsMeta: FlatHostMeta[] = flattenPredefinedHosts(DEFAULT_HOSTS);

  const isPredefined = (meta: FlatHostMeta): meta is SingleParserHostMeta => 'id' in meta;

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
    const meta = JSON.parse(additionalMeta?.length ? additionalMeta : '[]') as FlatHostMeta[];

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

  const hostFilter = (meta: FlatHostMeta): boolean => {
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
