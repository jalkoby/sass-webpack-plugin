/* globals describe, it */

const path = require('path');
const expect = require('chai').expect;
const SassPlugin = require('../src').default;
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const fixture = rest => path.join('.', 'demo', 'src', rest);
const fixture_abs = rest => path.resolve(fixture(rest));

function build(plugin) {
  let compiler = webpack({
    entry: path.resolve(fixture('index.js')),
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
      expect(plugin.files[fixture_abs('index.scss')]).to.equal('index.css');
      expect(plugin.options.sourceMap).to.be.true;
      expect(plugin.options.sass.indentedSyntax).to.be.true;
      expect(plugin.options.sass.indentWidth).to.eq(2);
      done();
    });

    it('handles file + options case', function(done) {
      let plugin = new SassPlugin(fixture('index.sass'), { sass: { indentWidth: 4 } });
      expect(plugin.files[fixture_abs('index.sass')]).to.equal('index.css');
      expect(plugin.options.sourceMap).to.be.true;
      expect(plugin.options.sass.indentedSyntax).to.be.undefined;
      expect(plugin.options.sass.indentWidth).to.eq(4);
      done();
    });

    it('handles file + production mode case', function(done) {
      let plugin = new SassPlugin([fixture('src/custom.sass')], 'production');
      expect(plugin.files[fixture_abs('src/custom.sass')]).to.equal('custom.css');
      expect(plugin.options.sass.outputStyle).to.equal('compressed');
      expect(plugin.options.autoprefixer).to.be.true;
      done();
    });

    it('handles file + mode + options case', function(done) {
      let plugin = new SassPlugin('src/index.scss', process.env.NODE_ENV, { sass: { indentWidth: 4 } });
      expect(plugin.options.sourceMap).to.be.true;
      expect(plugin.options.sass.indentedSyntax).to.be.true;
      expect(plugin.options.sass.indentWidth).to.equal(4);
      done();
    });
  });

  describe('#apply', function() {
    it('is used in compile mode', function(done) {
      compile(new SassPlugin(fixture('loading.scss'), 'production', { sass: { includePaths: [path.resolve(__dirname, '..', 'node_modules')]} }), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('loading.css');
        expect(compilation.assets).to.have.property('loading.css.map');
        expect(fs.readFileSync('/webpack/loading.css').toString()).to.contain('@keyframes pulse{50%{background:#659998}}');
        done();
      });
    });

    it('adds source maps if they were set', function(done) {
      compile(new SassPlugin(fixture('page.sass')), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('page.css');
        expect(fs.readFileSync('/webpack/page.css').toString()).to.contain('sourceMappingURL=page.css.map');
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
      watch(new SassPlugin({ [fixture('page.sass')]: 'index.css' }), function(stats, fs, compilation) {
        expect(stats.errors).to.be.empty;
        expect(compilation.assets).to.have.property('index.css');
        expect(compilation.fileDependencies).to.contain(fixture_abs('page.sass'));
        expect(compilation.fileDependencies).to.contain(fixture_abs('_variables.scss'));
        done();
      });
    });
  });
});
