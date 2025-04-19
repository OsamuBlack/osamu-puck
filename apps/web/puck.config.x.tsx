import type { Config } from "@measured/puck";

import { 
  ComponentConfigAutoField,
  ComponentNestedAutoFieldsConfig,
  ComponentNestedConfig,
  ComponentNestedType,
  ComponentSimpleConfig,
  ComponentSimpleType
 } from "@workspace/puck/field-switch";

type ComponentProps = {
  simple: ComponentSimpleType;
  auto: ComponentSimpleType;
  nested: ComponentNestedType;
  nestedAuto: ComponentNestedType;
};

type RootProps = {
  title: string;
};

export const config: Config<ComponentProps, RootProps> = {
  components: {
    simple: ComponentSimpleConfig,
    auto: ComponentConfigAutoField,
    nested: ComponentNestedConfig,
    nestedAuto: ComponentNestedAutoFieldsConfig,
  },
  root: {},
};

export default config;
