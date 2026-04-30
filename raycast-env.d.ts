/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `redact-clipboard` command */
  export type RedactClipboard = ExtensionPreferences & {}
  /** Preferences accessible in the `redact-paste` command */
  export type RedactPaste = ExtensionPreferences & {}
  /** Preferences accessible in the `workbench` command */
  export type Workbench = ExtensionPreferences & {}
  /** Preferences accessible in the `audit` command */
  export type Audit = ExtensionPreferences & {}
  /** Preferences accessible in the `feeds` command */
  export type Feeds = ExtensionPreferences & {}
  /** Preferences accessible in the `settings` command */
  export type Settings = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `redact-clipboard` command */
  export type RedactClipboard = {}
  /** Arguments passed to the `redact-paste` command */
  export type RedactPaste = {}
  /** Arguments passed to the `workbench` command */
  export type Workbench = {}
  /** Arguments passed to the `audit` command */
  export type Audit = {}
  /** Arguments passed to the `feeds` command */
  export type Feeds = {}
  /** Arguments passed to the `settings` command */
  export type Settings = {}
}

