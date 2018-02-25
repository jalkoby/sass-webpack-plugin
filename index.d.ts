import { Options } from 'node-sass';
export type NODE_ENV = 'production' | 'development';
export type FileRule = string | string[] | { [key: string]: string };
export interface Config {
  sourceMap?: boolean;
  autoprefixer?: boolean;
  sass?: Options;
}
export default class SassPlugin {
  constructor(file: FileRule, mode?: NODE_ENV | Config);
  constructor(file: FileRule, mode: NODE_ENV, config?: Config);
}
