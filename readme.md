# component2jspm

# +++ WORK IN PROGRESS +++

This tool helps you to migrate your project from [component](https://github.com/componentjs/component) to [jspm](http://jspm.io).

Component has some drawbacks:

- if you want to _componentize_ a project without a pull request, you need a fork
- cannot use npm as an endpoint, only GitHub and BitBucket are supported
- really hard to use plugins to convert coffee, jade, etc. (not possible with CLI)
- annoying to upgrade dependencies all your locals
- no dev activity anymore, [see Contributions](https://github.com/componentjs/component/graphs/contributors)


So many developer switch to other tools like browserify, webpack or jspm.

If you're using component, jspm should be a good choice, because it provides support for
both endpoints: GitHub and npm

### Install

npm install component2jspm -g

### Usage

```
Usage: component2jspm [options] <directory>

  Options:

    -h, --help                       output usage information
    -s, --style [short, long, none]  define alias style for require paths
    -j, --json                       write out as json
```

This command prints out you some information and at the end a command which you can
execute in your terminal.

This command use the jspm CLI and installs the dependencies you need for your application.

### How it works

This tool generate a jspm CLI command which installs dependencies which are found
in your component.json files.

Dependencies will be managed in the root scope of your application, not by the
local components anymore. jspm write down all dependencies in your package.json file
with a __jspm__ prefix, so you won't break anything with this step.

jspm use a flat versioned dependency management, you can find it in the __config.js__ file.
It's like a npm shrinkwrap file, but flat, this makes it really easy to maintain and fix
conflicts in your dependency hierarchy.

##### registry

With the generated command jspm will install your (direct) dependencies via GitHub.
But all transitive dependencies need to be installed via npm, because jspm can't read
the __component.json__, it just uses the __package.json__ and the dependencies in the __package.json__ are bind to the npm registry.

That's the reason why the command contains a `-o '{"registry": "npm"}'` at the end.
This awesome feature of jpsm allows you to override properties in each __pacakge.json__ of your dependencies.

##### module name mapping

Remote dependencies in component are fetched via the GitHub endpoint.
Dependencies are defined with this syntax: `"user/repo": "version"`

If you want to use a remote dependency in your code you usually use the shorthand syntax.
For instance if you use `component/dom` dependency you can use it via `require('dom')`

You can also use full name: `require('component-dom')`.

In jspm the default syntax is `require('component/dom')`, but jspm allows to
define aliases. When running the converer it use the shorthand syntax as default.
If you want to use the full name, you need to add an argument.


Summarize the styles:
- `require('component/dom')`    - jspm
- `require('dom')`              - component shorthand (possible name clashes)
- `require('component-dom')`    - component full (no name-clash)

### Migration Guide

TODO: next steps

TODO: handling CSS
TODO: handling fonts
TODO: handling assets
TODO: handling template (html, jade, ...)


##### Cleanup
If everything works fine, you should be able to delete all your component.json files


### FAQ

##### Do I need to change my code?
If you don't have nameclashes in your application and don't use some fancy [lookup paths](https://github.com/componentjs/spec/blob/master/component.json/specifications.md#paths)
in your __component.json__, it should work without touching the app code.

You can check if you have some name clashes by running `component2jspm`.
It will tell you your clashes at the beginning.

##### What will happen with all my locals?
Remote dependencies will not managed by the locals anymore. It turns out that
this has some drawbacks, see [issue #638](https://github.com/componentjs/component/issues/638)

##### What does -o '{"registry": "npm"}' mean?
Please read the [registry part](#registry)

##### I'm using BitBucket, can I use this tool?
No yet. jspm does not provide support for BitBucket, but you can write a module.
You can start with forking the github module for jspm: [jspm/github](https://github.com/jspm/github)

### Cooming soon

`--regitry npm`

To get rid of all these __override__ entries in the package.json or even worse: installing modules twice, via github and npm. This happens if you have a dependency to a module, which will be installed via github and this module is also a transitive dependency of another dependency, which will installed via npm in this case.

With the `--registry` option allows to install depenencies from npm, if there is a __repo__ property in the package.json of the dependency.
