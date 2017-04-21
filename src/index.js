import sass from 'node-sass';
import path from 'path';
import Audit from './audit';

const MARK = '[sass-webpack-plugin]';

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
    let rootDir = path.dirname(options.file);
    let audit = new Audit(path.join(compiler.context, 'node_modules'));

    compiler.plugin('compilation', (compilation) => {
      // skip child compilers
      if(compilation.compiler !== compiler) return;

      audit.calculateHash(compilation.fileTimestamps);
      if(audit.hash == null) return;

      compilation.plugin('additional-assets', (cb) => {
        log('Compiling...');
        sass.render(options, (err, result) => {
          if(err) {
            log('Compilation failed.');
            compilation.errors.push(wrapError(err));
          } else {
            log('Compiled successfully.');
            compilation.assets[toFilename(options.file)] = toAsset(result);
            audit.track(result.stats, compilation.fileDependencies);

            if(audit.hash === 'init') {
              compilation.contextDependencies.push(rootDir);
            } else {
              compilation.modifyHash(audit.hash);
            }
          }
          cb();
        });
      });
    });
  }
}

export default SassPlugin;
