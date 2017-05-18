const EXCLUDE_PATTERN = /node_modules|bower_components/;

function addDep(list, item) {
  if(list.indexOf(item) === -1) list.push(item);
}

export default class Audit {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.includedFiles = [];
    this.result = null;
    this.lastStartAt = null;
    this.hash = null;
  }

  isUpToDay(timestamps) {
    if(this.lastStartAt) {
      var maxTimestamp = this.includedFiles.reduce(function(acc, key) {
        if(timestamps[key] && acc < timestamps[key]) {
          return timestamps[key];
        } else {
          return acc;
        }
      }, 0);

      if(this.lastStartAt < maxTimestamp) {
        this.hash = maxTimestamp.toString();
      } else {
        this.hash = null;
        return true;
      }
    } else {
      this.hash = 'init';
    }

    return false;
  }

  track(stats) {
    this.result = {
      includedFiles: stats.includedFiles.filter(file => !EXCLUDE_PATTERN.test(file)),
      start: stats.start
    };
  }

  handle(compilation) {
    if(this.result !== null) {
      this.lastStartAt = this.result.start;
      this.includedFiles = this.result.includedFiles;
      this.result = null;
    }

    addDep(compilation.contextDependencies, this.rootDir);
    this.includedFiles.forEach(file => addDep(compilation.fileDependencies, file));
    if(this.hash && this.hash !== 'init') compilation.modifyHash(this.hash);
  }
}
