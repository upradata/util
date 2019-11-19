/* console.log(module.exports);
module = module || {};
const modules = module.exports || {};
 */
const modules = module.exports;

if (typeof ENVIRONMENT === 'undefined' || ENVIRONMENT === 'node') {
    const module = require('./path-normalize');

    for (const k of Object.keys(module))
        modules[k] = module[k];
}

// modules.caca = "caca";
modules.dummyPropToMakeItWorkInUsefulExportAll = 'dummy';
