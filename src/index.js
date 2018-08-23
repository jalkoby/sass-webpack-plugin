import path from 'path'
import lodash from 'lodash'
import Audit from './audit'
import Processor from './processor'

const MARK = 'sass-webpack-plugin';

const toFilename = originFile => path.basename(originFile).replace(/(scss|sass)$/i, 'css');

const wrapError = err => {
  let header = MARK;
  if(err.file && err.line) {
    header = `${header} ${err.file}:${err.line}`;
  }
  return new Error(`${header}\n\n${err.message}\n`);
}

// eslint-disable-next-line no-console
const printLine = message => console.log(`[${MARK}] ${message}`);
const printConfigWarning = message => {
  printLine(`${message}`);
  printLine('Please check the valid options at https://www.npmjs.com/package/sass-webpack-plugin');
}

const processFiles = files => {
  if(typeof files === 'string') {
    return { [path.resolve(files)]: toFilename(files) };
  } else if(Array.isArray(files)) {
    return files.reduce((acc, file) => {
      acc[path.resolve(file)] = toFilename(file);
      return acc;
    }, {});
  } else if(typeof files === 'object') {
    return Object.keys(files).reduce((acc, file) => {
      acc[path.resolve(file)] = files[file];
      return acc;
    }, {});
  } else {
    printConfigWarning('files argument should be string | array | object');
    process.exit(1);
  }
}

const KNOWN_OPTIONS = ['sourceMap', 'sass', 'autoprefixer', 'compileOnSave'];
const processConfig = (mode, config) => {
  let options = { sourceMap: true, sass: { sourceMapContents: true }, compileOnSave: false };

  if(mode === 'development' || mode === undefined) {
    options.sass.indentedSyntax = true;
    options.sass.indentWidth = 2;
    options.sass.sourceComments = true;
  } else if(mode === 'production') {
    options.sass.outputStyle = 'compressed';
    options.autoprefixer = true;
  } else if(typeof mode === 'object') {
    config = mode;
  }

  if(typeof config === 'object') {
    let unknownKeys = Object.keys(config).filter(key => KNOWN_OPTIONS.indexOf(key) === -1);
    if(unknownKeys.length > 0) {
      printConfigWarning(`Only ${KNOWN_OPTIONS.join(',')} are valid options`);
    }
    lodash.merge(options, config);
  }

  return options;
}

class SassPlugin {
  constructor(files, mode, config) {
    this.files = processFiles(files);
    this.options = processConfig(mode, config);
  }

  apply(compiler) {
    Object.keys(this.files).forEach(file => {
      let audit = new Audit(path.dirname(file));
      let outFile = this.files[file];
      let processor = new Processor(file, outFile, this.options);

      compiler.plugin('compilation', (compilation) => {
        // skip child compilers
        if(compilation.compiler !== compiler) return;

        if(audit.isUpToDay(compilation.fileTimestamps) && !this.options.compileOnSave) return;

        compilation.plugin('additional-assets', cb => {
          processor.process().then(([stats, asset, sourceMaps]) => {
            audit.track(stats);
            compilation.assets[outFile] = asset;
            if(sourceMaps) {
              compilation.assets[`${outFile}.map`] = sourceMaps;
            }
            cb();
          }, err => {
            compilation.errors.push(wrapError(err));
            cb();
          });
        });
      });

      compiler.plugin('after-emit', (compilation, cb) => {
        audit.handle(compilation);
        cb();
      });
    });
  }
}

export default SassPlugin;
