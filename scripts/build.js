#!/usr/bin/env node

const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const del = require('del');
const fs = require('fs');

let pkg = require('../package.json');
delete pkg.private;
delete pkg.devDependencies;
delete pkg.scripts;

let babelConfig = pkg.babel;
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map(p => p[0] === 'env' ? ['env', { ...p[1], modules: false } ] : p);
delete pkg.babel;

[
  { format: 'cjs' },
  { format: 'es', suffix: '.es' }
].reduce(function(promise, bundle) {
  var compileConf = {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies).concat(['path']),
    plugins: []
  }

  if(bundle.format !== 'es') {
    compileConf.plugins.push(babel(babelConfig));
  }

  var writeConf = { file: `dist/index${ bundle.suffix || '' }.js` };
  if(bundle.format) writeConf.format = bundle.format;

  return promise.then(() => rollup(compileConf)).then(bundle => bundle.write(writeConf))
}, del(['dist/*']))

.then(function() {
  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
  fs.writeFileSync('dist/LICENSE', fs.readFileSync('LICENSE', 'utf-8'), 'utf-8');
  fs.writeFileSync('dist/README.md', fs.readFileSync('README.md', 'utf-8'), 'utf-8');
})

.catch(err => console.error(err.stack));
