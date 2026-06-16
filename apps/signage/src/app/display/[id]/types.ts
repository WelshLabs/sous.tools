import { SignageLayoutConfig } from "@soustools/api-types";

/**
 * Represents the configuration and details of a television signage layout.
 *
 * @tenant-docs-export
 * Restaurant managers configure signage layouts inside the kitchen portal to assign slide behaviors to displays.
 */
export interface SignageLayout {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  config: SignageLayoutConfig;
}
