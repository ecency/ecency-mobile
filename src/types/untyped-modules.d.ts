// Shorthand ambient declarations for dependencies that publish no TypeScript
// types and have no DefinitelyTyped package. Imports from these resolve as
// `any`; remove an entry if the dependency ever ships its own types.
declare module 'hive-auth-wrapper';
declare module 'react-native-heic-converter';
declare module 'react-native-modal-dropdown';
declare module '@esteemapp/react-native-multi-slider';
declare module '@esteemapp/react-native-autocomplete-input';

// Typed locally: the DefinitelyTyped package depends on react-native "*",
// which resolves a second React Native tree on fresh installs.
declare module 'react-native-highlight-words' {
  import type { ComponentType } from 'react';
  import type { StyleProp, TextStyle } from 'react-native';

  export interface HighlighterProps {
    autoEscape?: boolean;
    highlightStyle?: StyleProp<TextStyle>;
    searchWords: string[];
    textToHighlight: string;
    sanitize?: (text: string) => string;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
  }
  const Highlighter: ComponentType<HighlighterProps>;
  export default Highlighter;
}
