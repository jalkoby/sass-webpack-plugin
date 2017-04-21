export default class Audit {
  constructor(skipDir) {
    this.skipDir = skipDir;
    this.includedFiles = [];
    this.lastStartAt = null;
    this.hash = null;
  }

  track(stats, deps) {
    this.includedFiles.length = 0;
    stats.includedFiles.forEach((file) => {
      if(!file.startsWith(this.skipDir)) {
        this.includedFiles.push(file);

        if(deps.indexOf(file) === -1) deps.push(file);
      }
    });

    this.lastStartAt = stats.start;
  }

  calculateHash(timestamps) {
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
      }
    } else {
      this.hash = 'init';
    }
  }
}
