import type { Config } from "@measured/puck";

import {
  BaseComponentConfig,
  BaseComponentType,
} from "@workspace/puck/base/config";
import { ButtonConfig, ButtonType } from "@workspace/puck/button/config";
import { CardConfig, CardType } from "@workspace/puck/card/config";
import {
  TypographyConfig,
  TypographyType,
} from "@workspace/puck/typography/config";

type ComponentProps = {
  base: BaseComponentType;
  button: ButtonType;
  typography: TypographyType;
  card: CardType;
};

type RootProps = {
  title: string;
};

export const config: Config<ComponentProps, RootProps> = {
  components: {
    base: BaseComponentConfig,
    button: ButtonConfig,
    typography: TypographyConfig,
    card: CardConfig,
  },
  root: {},
};

export default config;
