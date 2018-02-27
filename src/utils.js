import path from 'path';
import lodash from 'lodash';

const MARK = 'sass-webpack-plugin';

export function addDep(list, item) {
  if (list.indexOf(item) === -1) list.push(item);
}

const toFilename = originFile =>
  path.basename(originFile).replace(/(scss|sass)$/i, 'css');

export const wrapError = err => {
  let header = MARK;
  if (err.file && err.line) {
    header = `${header} ${err.file}:${err.line}`;
  }
  return new Error(`${header}\n\n${err.message}\n`);
};

// eslint-disable-next-line no-console
const printLine = message => console.log(`[${MARK}] ${message}`);
const printConfigWarning = message => {
  printLine(`${message}`);
  printLine(
    'Please check the valid options at https://www.npmjs.com/package/sass-webpack-plugin'
  );
};

export const processFiles = files => {
  if (typeof files === 'string') {
    return { [path.resolve(files)]: toFilename(files) };
  } else if (Array.isArray(files)) {
    return files.reduce((acc, file) => {
      acc[path.resolve(file)] = toFilename(file);
      return acc;
    }, {});
  } else if (typeof files === 'object') {
    return Object.keys(files).reduce((acc, file) => {
      acc[path.resolve(file)] = files[file];
      return acc;
    }, {});
  } else {
    printConfigWarning('files argument should be string | array | object');
    process.exit(1);
  }
};

const KNOWN_OPTIONS = ['sourceMap', 'sass', 'autoprefixer'];
export const processConfig = (mode, config) => {
  let options = { sourceMap: true, sass: { sourceMapContents: true } };

  if (mode === 'development' || mode === undefined) {
    options.sass.indentedSyntax = true;
    options.sass.indentWidth = 2;
    options.sass.sourceComments = true;
  } else if (mode === 'production') {
    options.sass.outputStyle = 'compressed';
    options.autoprefixer = true;
  } else if (typeof mode === 'object') {
    config = mode;
  }

  if (typeof config === 'object') {
    let unknownKeys = Object.keys(config).filter(
      key => KNOWN_OPTIONS.indexOf(key) === -1
    );
    if (unknownKeys.length > 0) {
      printConfigWarning(`Only ${KNOWN_OPTIONS.join(',')} are valid options`);
    }
    lodash.merge(options, config);
  }

  return options;
};
