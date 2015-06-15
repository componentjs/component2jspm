var glob = require('glob');
var fs = require('fs');

var findJsonFiles = function(lookupPath) {
    var files = glob.sync(lookupPath + '/**/component.json');
    return files;
};

var checkForNameClashes = function(dependencyHash) {
    var nameClashes = {};
    for (var name in dependencyHash) {
        var userAndRepo = name.split('/');
        var user = userAndRepo[0];
        var repo = userAndRepo[1];
        if (nameClashes[repo]) {
            nameClashes[repo].count++;
            nameClashes[repo].user.push(user);
        } else {
            nameClashes[repo] = {
                count: 1,
                repo: repo,
                user: [user]
            };
        }
    }
    return nameClashes;
};

var convertToJspmCli = function(dependencyHash, style) {
    var meta = checkForNameClashes(dependencyHash);
    var conflicts = {};
    var jspmDeps = [];
    for (var name in dependencyHash) {
        var styleForThisDep = style;
        var repo = name.split('/')[1];
        var command = null;
        if (styleForThisDep === 'short' && meta[repo].count > 1) {
            styleForThisDep = 'long';
            conflicts[repo] = meta[repo];
        }
        if (styleForThisDep === 'short') {
            command = repo + '=github:' + name;
        } else if (styleForThisDep === 'long'){
            command = name.replace('/', '-') + '=github:' + name;
        } else if (styleForThisDep === 'none') {
            command = 'github:' + name;
        } else {
            throw new Error('unknown style: ' + styleForThisDep);
        }
        // add override for dependencies

        var version = dependencyHash[name].version;
        if (version.indexOf('v') === 0) {
            version = version.substr(1);
        }
        jspmDeps.push(command + '@' + version);
    }

    var conflictsAsArray = [];
    for (var name in conflicts) {
        conflictsAsArray.push(conflicts[name]);
    }
    return {
        command: 'jspm install ' + jspmDeps.join(' ') + " -o '{\"registry\": \"npm\"}'",
        conflicts: conflictsAsArray
    };
};

var main = function(lookupPath, style) {
    var dependencyHash = {};
    var forks = {};

    var files = findJsonFiles(lookupPath);
    files.forEach(function(file) {
        var content = fs.readFileSync(file, {encoding: 'utf8'});
        var jsonObject = JSON.parse(content).dependencies || {};

        for (var name in jsonObject) {

            var version = jsonObject[name];
            var dependencyHashItem = dependencyHash[name];
            if (dependencyHashItem) {
                // the dep exists already
                // check if it's the same version or a 'fork'
                if (version !== dependencyHashItem.version) {
                    dependencyHashItem.forks.push(value);
                }
            } else {
                dependencyHash[name] = {
                    version: version,
                    forks: [version]
                };
            }
        }
    });

    var result = convertToJspmCli(dependencyHash, style);
    result.dependencies = dependencyHash;
    return result;
};

module.exports = main;