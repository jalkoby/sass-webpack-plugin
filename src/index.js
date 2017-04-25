import sass from 'node-sass';
import path from 'path';
import Audit from './audit';

const MARK = 'sass-webpack-plugin';

function toFilename(originFile) {
  return path.basename(originFile).replace(/(scss|sass)$/i, 'css');
}

function toAsset(result) {
  return {
    map: () => result.map,
    source: () => result.css,
    size: () => result.css.byteLength
  };
}

function wrapError(err) {
  var header = MARK;
  if(err.file && err.line) {
    header = `${header} ${err.file}:${err.line}`;
  }
  return new Error(`${header}\n\n${err.message}\n`);
}

function log(message) {
  /* eslint-disable no-console */
  console.log(`${MARK}: ${message}`);
  /* eslint-enable no-console */
}

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
    let chunk;

    compiler.plugin('compilation', (compilation) => {
      // skip child compilers
      if(compilation.compiler !== compiler) return;

      chunk = compilation.addChunk(MARK);
      chunk.ids = [];
      if(chunk.files.indexOf(fileName) === -1) chunk.files.push(fileName);

      if(audit.isUpToDay(compilation.fileTimestamps)) return;

      compilation.plugin('additional-assets', (cb) => {
        log('Compiling...');
        sass.render(options, (err, result) => {
          if(err) {
            log('Compilation failed.');
            compilation.errors.push(wrapError(err));
          } else {
            log('Compiled successfully.');
            compilation.assets[fileName] = toAsset(result);
            audit.track(result.stats);
          }
          cb();
        });
      });
    });

    compiler.plugin('emit', (compilation, cb) => {
      let mainModule = compilation.modules[0];
      chunk.addModule(mainModule);
      mainModule.addChunk(chunk);
      compilation.chunks.push(chunk);
      cb();
    });

    compiler.plugin('after-emit', (compilation, cb) => {
      audit.handle(compilation);
      cb();
    });
  }
}

export default SassPlugin;
