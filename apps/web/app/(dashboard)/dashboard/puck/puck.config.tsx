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
import {
  defaultMetadata,
  metadataFields,
  MetadataProps,
} from "@workspace/puck/next-meta/config";

type ComponentProps = {
  base: BaseComponentType;
  button: ButtonType;
  typography: TypographyType;
  card: CardType;
};

type RootProps = MetadataProps;

export const config: Config<ComponentProps, RootProps> = {
  components: {
    base: BaseComponentConfig,
    button: ButtonConfig,
    typography: TypographyConfig,
    card: CardConfig,
  },
  root: {
    fields: metadataFields,
    defaultProps: defaultMetadata,
  },
};

export default config;
