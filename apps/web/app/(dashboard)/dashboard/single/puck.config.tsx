import type { Config } from "@measured/puck";

import { BaseComponentConfig, BaseComponentType } from "@workspace/puck/base/config";

type ComponentProps = {
  base: BaseComponentType;
};

type RootProps = {
  title: string;
};

export const config: Config<ComponentProps, RootProps> = {
  components: {
    base: BaseComponentConfig,
  },
  root: {},
};

export default config;
