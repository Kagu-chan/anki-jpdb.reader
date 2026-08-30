import { debug } from '@shared/debug';
import { FlatHostMeta, SingleParserHostMeta } from '@shared/host-meta/types';
import { BaseParser } from './base.parser';
import { ExStaticParser } from './custom-parsers/ex-static.parser';
import { MokuroLegacyParser } from './custom-parsers/mokuro-legacy.parser';
import { MokuroParser } from './custom-parsers/mokuro.parser';
import { ReadwokParser } from './custom-parsers/readwok.parser';
import { SatoriReaderParser } from './custom-parsers/satori-reader.parser';
import { TtsuParser } from './custom-parsers/ttsu.parser';

export const getCustomParser = (
  name: Exclude<SingleParserHostMeta['custom'], undefined>,
  meta: FlatHostMeta,
): BaseParser => {
  const parsers: Record<
    Exclude<SingleParserHostMeta['custom'], undefined>,
    new (meta: FlatHostMeta) => BaseParser
  > = {
    MokuroParser,
    MokuroLegacyParser,
    ReadwokParser,
    TtsuParser,
    ExStaticParser,
    SatoriReaderParser,
  };
  const parser = parsers[name];

  debug(`getCustomParser called with name: ${name}`, 'meta:', meta);

  return new parser(meta);
};
