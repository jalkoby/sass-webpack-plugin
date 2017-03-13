export default class Audit {
  constructor(skipDir) {
    this.skipDir = skipDir;
    this.includedFiles = [];
    this.lastStartAt = null;
    this.hash = null;
  }

  track(stats) {
    this.includedFiles = stats.includedFiles.filter(function(file) {
      return !file.startsWith(this.skipDir);
    }.bind(this));
    this.lastStartAt = stats.start;
  }

  getDependencies(currentDeps) {
    return this.includedFiles.filter(function(file) {
      return currentDeps.indexOf(file) === -1;
    });
  }

  calculateHash(timestamps) {
    if(this.lastStartAt) {
      var maxTimestamp = this.includedFiles.reduce(function(acc, key) {
        var t = timestamps[key] || Date.now();
        return acc < t ? t : acc;
      }, 0);

      if(this.lastStartAt < maxTimestamp) {
        this.hash = maxTimestamp.toString();
      } else {
        this.hash = null;
      }
    } else {
      this.hash = 'init';
    }
  }
}
