import { Options } from 'node-sass';
import { Plugin } from 'webpack';

export type NODE_ENV = 'production' | 'development';
export type FileRule = string | string[] | { [key: string]: string };
export interface Config {
  sourceMap?: boolean;
  autoprefixer?: boolean;
  sass?: Options;
}
export default class SassPlugin extends Plugin {
  constructor(file: FileRule, mode?: NODE_ENV | Config);
  constructor(file: FileRule, mode: NODE_ENV, config?: Config);
}
