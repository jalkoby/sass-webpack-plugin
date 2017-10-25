import sass from 'node-sass'
import path from 'path'
import Audit from './audit'

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
}

// eslint-disable-next-line no-console
const printLine = message => console.log(`[${MARK}] ${message}`);
const printConfigWarning = message => {
  printLine(`${message}`);
  printLine('Please check the valid options at https://www.npmjs.com/package/sass-webpack-plugin');
}

const ALLOWED_OPTIONS = {
  sass: ['includePaths', 'indentedSyntax', 'indentWidth', 'linefeed', 'importer', 'functions', 'precision', 'maps'],
  postcss: []
};

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
    printConfigWarning('files should be string | array | object');
    process.exit(1);
  }
}

const processConfig = (mode, config) => {
  let options = { sass: { maps: true }, postcss: {} };

  if(mode === 'development' || mode === undefined) {
    options.sass.indentedSyntax = true;
    options.sass.indentWidth = 2;
  } else if(mode === 'production') {
    options.sass.outputStyle = 'compressed';
  } else if(typeof mode === 'object') {
    config = mode;
  }

  if(typeof config === 'object') {
    Object.keys(config).forEach(key => {
      if(ALLOWED_OPTIONS.hasOwnProperty(key)) {
        let subConfig = config[key];
        if(typeof subConfig === 'object') {
          Object.keys(subConfig).forEach(skey => {
            if(ALLOWED_OPTIONS[key].indexOf(skey) !== -1) {
              options[key][skey] = subConfig[skey];
            } else {
              printConfigWarning(`${key}.${skey} is not supported and will be omitted`);
            }
          });
        } else {
          printConfigWarning(`${key} is not object and will be omitted`);
        }
      } else {
        printConfigWarning(`${key} is not supported and will be omitted`);
      }
    });
  }

  return options;
}

const toSassOptions = (file, outFile, options) => {
  let result = Object.assign({ file }, options);
  if(options.maps) {
    Object.assign(result, {
      outFile,
      sourceMap: true,
      sourceMapEmbed: true,
      sourceComments: true,
      sourceMapContents: true
    });
  }
  return result;
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
      let sassOptions = toSassOptions(file, outFile, this.options.sass);

      compiler.plugin('compilation', (compilation) => {
        // skip child compilers
        if(compilation.compiler !== compiler) return;

        if(audit.isUpToDay(compilation.fileTimestamps)) return;

        compilation.plugin('additional-assets', (cb) => {
          sass.render(sassOptions, (err, result) => {
            if(err) {
              compilation.errors.push(wrapError(err));
            } else {
              compilation.assets[outFile] = toAsset(result);
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
    });
  }
}

export default SassPlugin;
