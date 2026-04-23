export default (versionString: string): number => {
  if (!versionString) {
    return 0;
  }
  const parts = versionString.split('.');
  // major * 1_000_000 + minor * 1_000 + patch
  const major = parseInt(parts[0], 10) || 0;
  const minor = parseInt(parts[1], 10) || 0;
  const patch = parseInt(parts[2], 10) || 0;
  return major * 1_000_000 + minor * 1_000 + patch;
};
