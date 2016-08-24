moduleLoader.nodejs
===================

A Strategy Loader pattern to load modules in a hMVC way

## How to use
```
require('moduleLoader');
```
After this require, the include function will be register in the global scope,
the idea is to require this module in yout main entry point

## Examples

### From any module, or javascript file in the code:
```
include('module!Employees') ==> modules/Employees/controllers/Employees.js
include('module!Providers') ==> modules/Providers/controllers/Providers.js

include('service!system') ==> services/system/system.js
include('service!Database') ==> services/Database/Database.js

```

### Inside of a module, i.e. Employees:
```
include('model!Employees') ==> modules/Employees/models/Employees.js
include('model!personal/Phones') ==> modules/Employees/models/personal/Phones.js
include('model!jobs/Kinds') ==> modules/Employees/models/jobs/Kinds.js
include('helper!LDAPConnector') ==> modules/Employees/helpers/LDAPConnector.js
include('view!personalDetails') ==> modules/Employees/views/personalDetails.js
include('template!personalDetails') ==> modules/Employees/templates/personalDetails.js
include('widget!phones') ==> modules/Employees/widgets/phones.js
```

## Customization

You can change the basePath, the default base path is the directory from your
main entrypoint. But you can change this using `include.setBasePath()`.

Also you can create and modify the internal strategys (model,helper,view,template,widget).
You are able to change the normal loader ('require') for a customized callback,
this is usable for example to get templates (in plain/text) or json files or
any another kind of types (a querys list in xml, css, etc...) in order to do this:

### Create your own strategy
```javascript
const {AbstractStrategy} = require('modulesLoader');

class Plugin extends AbstractStrategy {
	constructor(handlerOps) {
		super(handlerOps);
		this._baseDir = 'plugins';
	}

	resolve(kind, moduleName) {
		return this._baseDir + '/' + moduleName + 'Plugin.js';
	}

	getHandlers() {
		return ['plugin'];
	}

	load(path) {
		return super.load(path);
	}
};

include.registerStrategy(Plugin);
```
### Modify the current ones
```javascript
const {ModuleStrategy} = require('modulesLoader');
const moduleStrategy = include.getStrategy(ModuleStrategy);

moduleStrategy.addKind('part', 'parts/');

// now you can get include('part!partName') inside a module!

moduleStrategy.removeKind('template');
moduleStrategy.addKind('template', 'templates/', '.tmpl', function(absolutePath) {
	return yourFavouriteTemplateProcessor(absolutePath);
});

```
