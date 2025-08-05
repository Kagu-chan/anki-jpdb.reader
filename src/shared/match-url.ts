export const matchUrl = (matchPattern: string, host: string): boolean => {
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
