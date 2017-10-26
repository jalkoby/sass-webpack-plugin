import sass from 'node-sass'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'

const toSassOptions = (file, outFile, options) => {
  let result = Object.assign({ file }, options.sass);
  if(options.sourceMap) {
    result.sourceMap = true;
    result.outFile = outFile;
  }
  return result;
}

const strToAsset = source => ({
  source: () => source,
  size: () => Buffer.byteLength(source)
});

const bufferToAsset = source => ({
  source: () => source,
  size: () => source.byteLength
});


export default class {
  constructor(file, outFile, options) {
    this.file = file;
    this.outFile = outFile;
    this.sass = toSassOptions(file, outFile, options);
    this.withMapFile = this.sass.sourceMap && !this.sass.sourceMapEmbed;
    this.withAutoprefix = options.autoprefixer;
  }

  process() {
    return new Promise((resolve, reject) => {
      sass.render(this.sass, (err, sassResult) => {
        if(err) return reject(err);

        let { css, map } = sassResult;
        let output = [sassResult.stats];

        if(this.withAutoprefix) {
          this.autoprefix(css, map).then(postcssResult => {
            output.push(strToAsset(postcssResult.css));
            if(this.withMapFile) {
              output.push(strToAsset(postcssResult.map.toString()));
            }
            resolve(output);
          });
        } else {
          output.push(bufferToAsset(css));
          if(this.withMapFile) {
            output.push(bufferToAsset(map));
          }
          resolve(output);
        }
      });
    });
  }

  autoprefix(sassCss, sassMap) {
    let postcssConfig = { from: this.file, to: this.outFile };
    if(this.withMapFile) {
      postcssConfig.map = {
        annotation: false,
        sourceMapContents: this.sass.sourceMapContents,
        prev: sassMap.toString()
      };
    }
    return postcss([autoprefixer()]).process(sassCss, postcssConfig);
  }
}
