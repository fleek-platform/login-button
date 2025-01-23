export const getTopLevelDomain = (url: string) => {
  if (!url) throw Error('Oops! Invalid URL');

  try {
    const { hostname } = new URL(url);

    // The only expected hostnames
    // are a maximum of three levels
    // at time of writting
    // e.g. staging -> fleek-xyz-staging.on-fleek.app
    // and prod -> fleek.xyz
    const topLevelDomain = hostname.split('.').slice(-2).join('.');

    return topLevelDomain;
  } catch (e) {
    throw Error('Oops! Failed to parse the URL');
  }
};
