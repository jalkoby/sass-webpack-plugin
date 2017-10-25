/* globals describe, it */

const path = require('path');
const expect = require('chai').expect;
const SassPlugin = require('../src').default;
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

function fixture(rest) {
  return path.resolve(__dirname, '..', 'demo', 'src', rest);
}
function build(plugin) {
  let compiler = webpack({
    entry: fixture('index.js'),
    plugins: [plugin],
    output: { path: '/webpack', filename: 'index.js' }
  });
  let fs = new MemoryFS();
  compiler.outputFileSystem = fs;
  compiler.plugin('compilation', (compilation) => compilation.bail = true);
  return compiler;
}

function compile(plugin, cb) {
  let compiler = build(plugin);
  compiler.run((err, stats) => {
    if(err) throw err;
    let compilation = stats.compilation;
    stats = stats.toJson({ modules: true, reasons: true });
    cb(stats, compiler.outputFileSystem, compilation);
  });
}

function watch(plugin, cb) {
  let compiler = build(plugin);
  compiler.watch({}, (err, stats) => {
    if(err) throw err;
    let compilation = stats.compilation;
    stats = stats.toJson({ modules: true, reasons: true });
    cb(stats, compiler.outputFileSystem, compilation);
  });
}

describe('SassPlugin', function() {
  describe('#constructor', function() {
    it('handles file case', function(done) {
      let plugin = new SassPlugin('demo/src/index.scss');
      let options = plugin.options;
      expect(options.file).to.equal(fixture('index.scss'));
      expect(options.indentedSyntax).to.be.true;
      expect(options.indentWidth).to.eq(2);
      expect(options.sourceMap).to.be.true;
      expect(options.sourceMapEmbed).to.be.true;
      expect(options.sourceComments).to.be.true;
      expect(options.sourceMapContents).to.be.true;
      done();
    });

    it('handles file + options case', function(done) {
      let plugin = new SassPlugin(fixture('index.scss'), { foo: true, bar: 'tar' });
      let options = plugin.options;
      expect(options.file).to.equal(fixture('index.scss'));
      expect(options.foo).to.be.true;
      expect(options.bar).to.equal('tar');
      expect(options.indentedSyntax).to.be.undefined;
      done();
    });

    it('handles file + production mode case', function(done) {
      let plugin = new SassPlugin('src/custom.sass', 'production');
      let options = plugin.options;
      expect(options.outputStyle).to.equal('compressed');
      done();
    });

    it('handles file + mode + options case', function(done) {
      let plugin = new SassPlugin('src/index.scss', process.env.NODE_ENV, { indentWidth: 4, foo: true });
      let options = plugin.options;
      expect(options.indentWidth).to.equal(4);
      expect(options.foo).to.be.true;
      expect(options.sourceMap).to.be.true;
      done();
    });
  });

  describe('#apply', function() {
    it('is used in compile mode', function(done) {
      compile(new SassPlugin(fixture('index.scss'), 'production'), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('index.css');
        expect(fs.readFileSync('/webpack/index.css').toString()).to.contain('@keyframes pulse{50%{background:#659998}}');
        done();
      });
    });

    it('adds source maps if they were set', function(done) {
      compile(new SassPlugin(fixture('index.scss')), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('index.css');
        expect(fs.readFileSync('/webpack/index.css').toString()).to.contain('sourceMappingURL=data:application/json;base64');
        done();
      });
    });

    it('catches render errors', function(done) {
      compile(new SassPlugin(fixture('invalid.scss')), function(stats) {
        expect(stats.errors).to.be.lengthOf(1);
        let err = stats.errors[0];
        expect(err).to.contain('sass-webpack-plugin');
        done();
      });
    });
  });

  describe('#apply + watch', function() {
    it('audits style dependecies', function(done) {
      watch(new SassPlugin(fixture('index.scss')), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('index.css');
        expect(compilation.fileDependencies).to.contain(fixture('index.scss'));
        expect(compilation.fileDependencies).to.contain(fixture('_variables.scss'));
        expect(compilation.contextDependencies).to.contain(fixture(''));
        done();
      });
    });
  });
});
