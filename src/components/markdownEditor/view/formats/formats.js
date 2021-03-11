import applyWrapFormat from './applyWrapFormat';
import applyWrapFormatNewLines from './applyWrapFormatNewLines';
import applyListFormat from './applyListFormat';
import applyWebLinkFormat from './applyWebLinkFormat';

export default [
  {
    key: 'B',
    title: 'B',
    icon: 'bold',
    iconType: 'FontAwesome',
    wrapper: '**',
    onPress: applyWrapFormat,
  },
  {
    key: 'I',
    title: 'I',
    icon: 'italic',
    iconType: 'FontAwesome',
    wrapper: '*',
    onPress: applyWrapFormat,
  },
  {
    key: 'L',
    title: 'L',
    icon: 'table',
    iconType: 'FontAwesome',
    prefix: `| Column1 | Column2 |
| ------------ | ------------ |
|     Text      |      Text      |`,
    onPress: applyListFormat,
  },
  {
    key: 'link',
    title: 'WEB',
    onPress: applyWebLinkFormat,
  },
];
