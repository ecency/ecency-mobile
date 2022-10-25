import { diff_match_patch } from 'diff-match-patch';
import { CommentHistoryItem } from '../../providers/ecency/ecency.types';

const dmp = new diff_match_patch();

const make_diff = (str1: string, str2: string): string => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, '&nbsp;');
};

export default (raw: CommentHistoryItem[]) => {
  const t = [];

  let h = '';
  for (let l = 0; l < raw.length; l += 1) {
    if (raw[l].body.startsWith('@@')) {
      const p = dmp.patch_fromText(raw[l].body);
      h = dmp.patch_apply(p, h)[0];
      raw[l].body = h;
    } else {
      h = raw[l].body;
    }

    t.push({
      v: raw[l].v,
      title: raw[l].title,
      body: h,
      timestamp: raw[l].timestamp,
      tags: raw[l].tags.join(', '),
    });
  }

  for (let l = 0; l < t.length; l += 1) {
    const p = l > 0 ? l - 1 : l;

    t[l].titleDiff = make_diff(t[p].title, t[l].title);
    t[l].bodyDiff = make_diff(t[p].body, t[l].body);
    t[l].tagsDiff = make_diff(t[p].tags, t[l].tags);
  }

  return t;
};
