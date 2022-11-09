import { UnknownObject } from '@jovotech/framework/dist/types/index';
import {
  Core,
  CorePlatform,
  CorePlatformConfig,
  NormalizedCoreOutputTemplate,
} from '@jovotech/platform-core';

// #region customization
export enum Action {
  On = 'ACTION_ON',
  Off = 'ACTION_OFF',
  Temperature = 'ACTION_TEMP',
  Oscillation = 'ACTION_OSCILLATION',
}

export interface ZapAction {
  type: Action,
  data?: UnknownObject,
}

export interface ZapOutputTemplate extends NormalizedCoreOutputTemplate {
  actions?: ZapAction[];
}

// #endregion

declare module '@jovotech/framework/dist/types/Extensible' {
  interface ExtensiblePluginConfig {
    ZapPlatform?: CorePlatformConfig<'zap'>;
  }

  interface ExtensiblePlugins {
    ZapPlatform?: CorePlatform<'zap'>;
  }
}

declare module '@jovotech/framework/dist/types/Jovo' {
  interface Jovo {
    $zap?: Core;
  }
}


declare module '@jovotech/framework/dist/types/index' {
  interface NormalizedOutputTemplatePlatforms {
    zap?: ZapOutputTemplate;
  }
}

// declare module '@jovotech/framework/dist/types/index' {
//   interface NormalizedOutputTemplatePlatforms {
//     zap?: NormalizedCoreOutputTemplate;
//   }
// }

export const ZapPlatform = CorePlatform.createCustomPlatform('ZapPlatform', 'zap');
export * from '@jovotech/platform-core';
