import { HostMeta, PredefinedHostMeta } from '@shared/host-meta/types';
import { BaseParser } from './base.parser';
import { BunproParser } from './custom-parsers/bunpro.parser';
import { ExStaticParser } from './custom-parsers/ex-static.parser';
import { MokuroLegacyParser } from './custom-parsers/mokuro-legacy.parser';
import { MokuroParser } from './custom-parsers/mokuro.parser';
import { ReadwokParser } from './custom-parsers/readwok.parser';
import { TtsuParser } from './custom-parsers/ttsu.parser';

export const getCustomParser = (
  name: Exclude<PredefinedHostMeta['custom'], undefined>,
  meta: HostMeta,
): BaseParser => {
  const parsers: Record<
    Exclude<PredefinedHostMeta['custom'], undefined>,
    new (meta: HostMeta) => BaseParser
  > = {
    BunproParser,
    MokuroParser,
    MokuroLegacyParser,
    ReadwokParser,
    TtsuParser,
    ExStaticParser,
  };
  const parser = parsers[name];

  return new parser(meta);
};
