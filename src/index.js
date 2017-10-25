import sass from 'node-sass';
import path from 'path';
import Audit from './audit';

const MARK = 'sass-webpack-plugin';

const toFilename = originFile => path.basename(originFile).replace(/(scss|sass)$/i, 'css');

const toAsset = result => ({
  map: () => result.map,
  source: () => result.css,
  size: () => result.css.byteLength
});


const wrapError = err => {
  let header = MARK;
  if(err.file && err.line) {
    header = `${header} ${err.file}:${err.line}`;
  }
  return new Error(`${header}\n\n${err.message}\n`);
};

class SassPlugin {
  constructor(file, mode, custom) {
    var options = {};

    if(mode === 'development' || mode === undefined) {
      options = {
        indentedSyntax: true,
        indentWidth: 2,
        sourceMap: true,
        sourceMapEmbed: true,
        sourceComments: true,
        sourceMapContents: true
      };
    } else if(mode === 'production') {
      options = { outputStyle: 'compressed' };
    } else if(typeof mode === 'object') {
      options = mode;
    }

    if(typeof custom === 'object') {
      options = Object.assign(options, custom);
    }
    options.file = path.resolve(file);
    this.options = options;
  }

  apply(compiler) {
    let options = this.options;
    let fileName = toFilename(options.file);
    let audit = new Audit(path.dirname(options.file));

    compiler.plugin('compilation', (compilation) => {
      // skip child compilers
      if(compilation.compiler !== compiler) return;

      if(audit.isUpToDay(compilation.fileTimestamps)) return;

      compilation.plugin('additional-assets', (cb) => {
        sass.render(options, (err, result) => {
          if(err) {
            compilation.errors.push(wrapError(err));
          } else {
            compilation.assets[options.outFile || fileName] = toAsset(result);
            audit.track(result.stats);
          }
          cb();
        });
      });
    });

    compiler.plugin('after-emit', (compilation, cb) => {
      audit.handle(compilation);
      cb();
    });
  }
}

export default SassPlugin;
