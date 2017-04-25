const EXCLUDE_PATTERN = /node_modules|bower_components/;

function addDep(list, item) {
  if(list.indexOf(item) === -1) list.push(item);
}

export default class Audit {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.includedFiles = [];
    this.lastStats = null;
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
    this.lastStats = {
      includedFiles: stats.includedFiles.filter(file => !EXCLUDE_PATTERN.test(file)),
      start: stats.start
    };
  }

  handle(compilation) {
    this.lastStartAt = this.lastStats.start;
    this.includedFiles = this.lastStats.includedFiles;
    addDep(compilation.contextDependencies, this.rootDir);
    this.includedFiles.forEach(file => addDep(compilation.fileDependencies, file));
    if(this.hash && this.hash !== 'init') compilation.modifyHash(this.hash);
  }
}
