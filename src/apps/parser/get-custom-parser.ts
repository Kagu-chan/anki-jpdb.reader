import { HostMeta } from '@shared/host-meta';
import { BaseParser } from './base.parser';
import { BunproParser } from './custom-parsers/bunpro.parser';

export const getCustomParser = (
  name: Exclude<HostMeta['custom'], undefined>,
  meta: HostMeta,
): BaseParser => {
  const parsers: Record<
    Exclude<HostMeta['custom'], undefined>,
    new (meta: HostMeta) => BaseParser
  > = {
    BunproParser,
  };
  const parser = parsers[name];

  return new parser(meta);
};
