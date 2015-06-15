#!/usr/bin/env node
var findComponentFiles = require('./index');
var program = require('commander');

program
  .usage('[options] <directory>')
  .option('-s, --style [short, long, none]', 'define alias style for require paths', 'short')
  .option('-j, --json', 'write out as json')
  .parse(process.argv);

if (program.args.length <= 0) {
    console.log(program.help());
    return;
}

var dir = program.args[0];
var style = program.style;
var result = findComponentFiles(dir, style);

if (program.json) {
    console.log(result);
    return;
}

var dependencies = result.dependencies;
var hasForks = false;
for (var name in dependencies) {
    var meta = dependencies[name];
    if (meta.forks.length > 1) {
        hasForks = true;
        console.log('multiple versions found for "' + name + '"');
        console.log('  ' + meta.forks.join(','));
    }
}
if (hasForks) {
    console.log('you should consider to dedupe your dependencies');
}
if (result.conflicts != null) {
    console.log('name clashes found, long require style will be used for these:');
    result.conflicts.forEach(function(item) {
        var conflict = item.user.map(function(i){return i + '/' + item.repo});
        console.log('  ' + conflict.join('\n  '));
    });
}

console.log('');
console.log(result.command);