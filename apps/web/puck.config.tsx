import type { Config } from "@measured/puck";

import { BaseComponentConfig, BaseComponentSchema, BaseComponentType } from "@workspace/puck/base";
import { ButtonDerivedSchema, ButtonConfig, ButtonType, ButtonSchema } from "@workspace/puck/button";

type ComponentProps = {
  base: BaseComponentType;
  button: ButtonType;
};

type RootProps = {
  title: string;
};

export const schema = {
  base: BaseComponentSchema,
  button: ButtonSchema,
};

export const config: Config<ComponentProps, RootProps> = {
  components: {
    base: BaseComponentConfig,
    button: ButtonConfig,
  },
  root: {},
};

export default config;
