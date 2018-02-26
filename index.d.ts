import { Options } from 'node-sass';
import { Plugin } from 'webpack';

declare namespace SassPlugin {
  type NODE_ENV = 'production' | 'development';
  type FileRule = string | string[] | { [key: string]: string };
  interface Config {
    sourceMap?: boolean;
    autoprefixer?: boolean;
    sass?: Options;
  }
}

declare class SassPlugin extends Plugin {
  constructor(
    file: SassPlugin.FileRule,
    mode?: SassPlugin.NODE_ENV | SassPlugin.Config
  );
  constructor(
    file: SassPlugin.FileRule,
    mode: SassPlugin.NODE_ENV,
    config?: SassPlugin.Config
  );
}

export = SassPlugin;
