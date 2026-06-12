/**
 * Standard API response envelope pattern.
 * Use this to wrap all server responses for consistency.
 *
 * @template T The type of the payload data returned by the API.
 */
export interface ApiResponse<T> {
  /** Indicates if the operation was successful. */
  success: boolean;
  /** The payload data of the response, present if successful. */
  data?: T;
  /** Error message details, present if the operation failed. */
  error?: string;
  /** Timestamp indicating when the response was generated. */
  timestamp: string;
}

/**
 * Interface representing the structure of the hello endpoint response.
 */
export interface HelloResponse {
  /** The greeting message returned by the server. */
  message: string;
  /** The version of the API service. */
  version: string;
  /** Current server status. */
  status: "healthy" | "degraded" | "down";
}

export type SlideType = "MENU" | "IMAGE" | "VIDEO" | "IFRAME";

export interface BaseSlide {
  id: string;
  type: SlideType;
  durationSeconds: number;
}

export interface MenuSlide extends BaseSlide {
  type: "MENU";
  layoutTemplate: "GRID" | "SPLIT" | "COLUMNS";
  highlightItems: string[];
  customClassOverrides?: Record<string, string>;
}

export interface ImageSlide extends BaseSlide {
  type: "IMAGE";
  imageUrl: string;
  fit: "cover" | "contain";
}

export interface VideoSlide extends BaseSlide {
  type: "VIDEO";
  videoUrl: string;
  loop: boolean;
  mute: boolean;
}

export interface IframeSlide extends BaseSlide {
  type: "IFRAME";
  url: string;
}

export type SignageSlide = MenuSlide | ImageSlide | VideoSlide | IframeSlide;

export interface SignageOverlay {
  id: string;
  type: "TEXT" | "BADGE" | "IMAGE";
  content: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  customCssClass?: string;
}

/**
 * Configuration for a digital TV signage layout.
 * Includes styling, transitions, slide playlist, and overlays.
 */
export interface SignageLayoutConfig {
  /** The selected Google Font family to load. */
  googleFont?: string;
  /** Custom CSS overrides block injected in player. */
  customCss?: string;
  /** Action style when a menu item is sold out. */
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
  /** Playlist of signage slides to display in carousel. */
  slides: SignageSlide[];
  /** Absolutely positioned layers overlayed on slides. */
  overlays?: SignageOverlay[];
}

/**
 * Representation of a paired signage display hardware node.
 */
export interface SignageDisplay {
  id: string;
  organizationId: string;
  name: string;
  layoutId: string | null;
  pairingCode: string | null;
  isPaired: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

/**
 * Represents a menu item synchronized from Square/Toast POS.
 */
export interface PosItem {
  id: string;
  organizationId: string;
  squareId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}
