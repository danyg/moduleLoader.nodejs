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
