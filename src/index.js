import path from 'path';
import fs from 'fs';
import lodash from 'lodash';
import Processor from './processor';
import { processConfig, processFiles, addDep, wrapError } from './utils';

const EXCLUDE_PATTERN = /node_modules|bower_components/;

class SassPlugin {
  constructor(files, mode, config) {
    this.files = processFiles(files);
    this.options = processConfig(mode, config);

    this.dependMap = {};

    // file timestamps
    // I was tried use `compilation.fileTimestamps`, but it's not work
    this.fileTimestamps = {};
  }

  ifNeedRebuild(file) {
    const dependencies = this.dependMap[file];

    // first build
    if (!dependencies) {
      return true;
    }

    for (const dep of dependencies) {
      const timestamps = fs.statSync(dep).mtimeMs;
      const preTimestamps = this.fileTimestamps[dep];
      if (timestamps !== preTimestamps) {
        this.fileTimestamps[dep] = timestamps;
        return true;
      }
    }

    return false;
  }

  processFile(file, outFile, compilation) {
    const processor = new Processor(file, outFile, this.options);
    return processor
      .process()
      .then(([stats, asset, sourceMaps]) => {
        const includedFiles = stats.includedFiles.filter(
          file => !EXCLUDE_PATTERN.test(file)
        );

        compilation.assets[outFile] = asset;

        if (!this.dependMap[file]) {
          for (const dep of includedFiles) {
            this.fileTimestamps[dep] = fs.statSync(dep).mtimeMs;
          }
        }

        this.dependMap[file] = includedFiles;

        if (sourceMaps) {
          compilation.assets[`${outFile}.map`] = sourceMaps;
        }
      })
      .catch(error => {
        compilation.errors.push(wrapError(error));
      });
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const processQueue = [];

      for (const file of Object.keys(this.files)) {
        if (this.ifNeedRebuild(file)) {
          processQueue.push(
            this.processFile(file, this.files[file], compilation)
          );
        }
      }

      Promise.all(processQueue)
        .then(() => {
          callback();
        })
        .catch(() => {
          callback();
        });
    });

    compiler.plugin('after-emit', (compilation, callback) => {
      const dependencies = lodash
        .values(this.dependMap)
        .reduce((result, deps) => result.concat(deps), []);
      for (const dep of dependencies) {
        addDep(compilation.fileDependencies, path.normalize(dep));
      }
      callback();
    });
  }
}

export default SassPlugin;
