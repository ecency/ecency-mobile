// Local typings for react-native-vector-icons v10, which ships only Flow
// definitions for the per-set entry points. Deliberately not the
// DefinitelyTyped package: @types/react-native-vector-icons depends on the
// legacy @types/react-native, which conflicts with the types React Native
// bundles since 0.71.
declare module 'react-native-vector-icons/AntDesign' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/Feather' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/FontAwesome' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/FontAwesome5' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<
    TextProps & {
      name: string;
      size?: number;
      color?: string;
      solid?: boolean;
      brand?: boolean;
      light?: boolean;
    }
  >;
  export default Icon;
}
declare module 'react-native-vector-icons/Ionicons' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/MaterialIcons' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
declare module 'react-native-vector-icons/SimpleLineIcons' {
  import type { ComponentClass } from 'react';
  import type { TextProps } from 'react-native';

  const Icon: ComponentClass<TextProps & { name: string; size?: number; color?: string }>;
  export default Icon;
}
