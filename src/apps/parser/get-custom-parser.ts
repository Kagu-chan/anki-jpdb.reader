import { HostMeta } from '@shared/host-meta';
import { BaseParser } from './base.parser';
import { BunproParser } from './custom-parsers/bunpro.parser';
import { MokuroLegacyParser } from './custom-parsers/mokuro-legacy.parser';
import { MokuroParser } from './custom-parsers/mokuro.parser';

export const getCustomParser = (
  name: Exclude<HostMeta['custom'], undefined>,
  meta: HostMeta,
): BaseParser => {
  const parsers: Record<
    Exclude<HostMeta['custom'], undefined>,
    new (meta: HostMeta) => BaseParser
  > = {
    BunproParser,
    MokuroParser,
    MokuroLegacyParser,
  };
  const parser = parsers[name];

  return new parser(meta);
};
