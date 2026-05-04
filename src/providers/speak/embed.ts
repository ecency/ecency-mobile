export const THREE_SPEAK_MOBILE_LAYOUT_RATIO = 4 / 3;

export const isThreeSpeakUrl = (url?: string | null) => !!url && /3speak\.tv/i.test(url);

export const withThreeSpeakMobileLayout = (url?: string | null) => {
  if (!url || !isThreeSpeakUrl(url) || /[?&]layout=/i.test(url)) {
    return url || '';
  }

  const hashIndex = url.indexOf('#');
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
  const separator = base.includes('?') ? '&' : '?';

  return `${base}${separator}layout=mobile${hash}`;
};
