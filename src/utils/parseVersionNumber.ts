export default (versionString: string) =>
  parseFloat(versionString && versionString.replace(/\./, '')) || 0;
