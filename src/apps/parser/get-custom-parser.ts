import { HostMeta } from '@shared/host-meta';
import { BaseParser } from './base.parser';
import { BunproParser } from './custom-parsers/bunpro.parser';

export const getCustomParser = (name: HostMeta['custom'], meta: HostMeta): BaseParser => {
  const parser = {
    BunproParser,
  }[name!];

  return new parser(meta);
};
