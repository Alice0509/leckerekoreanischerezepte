const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');

function loadReweProductHelp({ react = React, navigator = {} } = {}) {
  const mod = { exports: {} };
  const dependencies = {
    react,
    '../lib/reweProductHelp.cjs': require('../../lib/reweProductHelp.cjs'),
    '../styles/ReweProductHelp.module.css': {},
  };
  const js = ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, '../../components/ReweProductHelp.js'),
      'utf8'
    ),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }
  ).outputText;
  vm.runInNewContext(js, {
    React: react,
    navigator,
    exports: mod.exports,
    module: mod,
    require(id) {
      assert.ok(
        Object.hasOwn(dependencies, id),
        `Unexpected dependency: ${id}`
      );
      return dependencies[id];
    },
  });
  return mod.exports.default;
}
module.exports = { loadReweProductHelp };
