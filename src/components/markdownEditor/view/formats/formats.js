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
    key: 'H1',
    title: 'H1',
    icon: 'format-size',
    iconType: 'MaterialCommunityIcons',
    prefix: '#',
    onPress: applyListFormat,
  },
  {
    key: 'L',
    title: 'L',
    icon: 'list',
    iconType: 'FontAwesome',
    prefix: '-',
    onPress: applyListFormat,
  },
  {
    key: 'C',
    title: 'C',
    icon: 'ios-code',
    wrapper: '`',
    onPress: applyWrapFormat,
  },
  {
    key: 'U',
    title: 'U',
    icon: 'underline',
    iconType: 'FontAwesome',
    wrapper: '__',
    onPress: applyWrapFormat,
  },
  {
    key: 'S',
    title: 'S',
    wrapper: '~~',
    icon: 'strikethrough',
    iconType: 'FontAwesome',
    onPress: applyWrapFormat,
  },
  {
    key: '>',
    title: '>',
    prefix: '>',
    icon: 'ios-quote',
    onPress: applyListFormat,
  },
  {
    key: 'CC',
    title: 'CC',
    icon: 'ios-code-working',
    wrapper: '```',
    onPress: applyWrapFormatNewLines,
  },
  {
    key: 'link',
    title: 'WEB',
    icon: 'link-2',
    iconType: 'Feather',
    onPress: applyWebLinkFormat,
  },
  // {
  //   key: 'H2',
  //   title: 'H2',
  //   prefix: '##',
  //   onPress: applyListFormat,
  // },
  // {
  //   key: 'H3',
  //   title: 'H3',
  //   prefix: '###',
  //   onPress: applyListFormat,
  // },
  // {
  //   key: 'H4',
  //   title: 'H4',
  //   prefix: '####',
  //   onPress: applyListFormat,
  // },
  // {
  //   key: 'H5',
  //   title: 'H5',
  //   prefix: '#####',
  //   onPress: applyListFormat,
  // },
  // {
  //   key: 'H6',
  //   title: 'H6',
  //   prefix: '######',
  //   onPress: applyListFormat,
  // },
];
