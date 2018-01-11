var camelCase = require('camel-case');
var reactMappings = require('./reactMappings');
var helpers = require('./helpers');
var styleToObj = helpers.styleToObj;
var valToStr = helpers.valToStr;

module.exports.copyMods = () => function copyMods(jsx, bemjson) {
    if (jsx.isBEMSimpleComponent) {
        bemjson.elem
            ? bemjson.elemMods && (jsx.props.mods = Object.assign({}, bemjson.elemMods))
            : bemjson.mods && (jsx.props.mods = Object.assign({}, bemjson.mods));
    } else {
        bemjson.elem
            ? bemjson.elemMods && Object.assign(jsx.props, bemjson.elemMods)
            : bemjson.mods && Object.assign(jsx.props, bemjson.mods);
    }
};

module.exports.processMixElemMods = () => function processMixElemMods(jsx, bemjson) {
    if(!bemjson.mix) {
        return;
    }

    [].concat(bemjson.mix).forEach(mixBlock => {
        if(mixBlock.elemMods) {
            mixBlock.mods = mixBlock.elemMods;
        }
    });
};

module.exports.copyTag = () => function copyTag(jsx, bemjson) {
    bemjson.tag && jsx.isBEMComponent && (jsx.props.tag = bemjson.tag);
};

module.exports.copyAttrs = () => function copyAttrs(jsx, bemjson) {
    if (bemjson.attrs && typeof bemjson.attrs === 'object' && !Array.isArray(bemjson.attrs)) {
        // camelCase attrs
        var attrs = Object.keys(bemjson['attrs']).reduce((acc, propKey) => {
            var propName = reactMappings.attrs[propKey];
            propName && (acc[propName] = bemjson['attrs'][propKey]);
            return acc;
        }, {});
        if (jsx.isBEMSimpleComponent) {
            // only attrs prop from BemSimpleComponent
            jsx.props.attrs = Object.assign({}, attrs);
        } else {
            // add all props from attrs to BemComponent or JSXComponent
            jsx.props = Object.assign({}, jsx.props, attrs);

            // But keep attrs prop for BemComponent
            if (jsx.isBEMComponent) {
                jsx.props.attrs = Object.assign({}, attrs);
            }
        }
    }
};

module.exports.processJsParams = () => function processJsParams(jsx, bemjson) {
    if(typeof bemjson.js === 'object') {
        Object.assign(jsx.props, bemjson.js);
    }
};

module.exports.camelCaseProps = () => function camelCaseProps(jsx) {
    jsx.props = Object.keys(jsx.props).reduce((acc, propKey) => {
        acc[camelCase(propKey)] = jsx.props[propKey];
        return acc;
    }, {});
};

module.exports.copyCustomFields = () => function copyCustomFields(jsx, bemjson) {
    var blackList = ['content', 'block', 'elem', 'mods', 'elemMods', 'attrs', 'tag', 'js'];

    Object.keys(bemjson).forEach(k => {
        if(~blackList.indexOf(k)) { return; }

        jsx.props[k] = bemjson[k];
    });
};

module.exports.stylePropToObj = () => function stylePropToObj(jsx) {
    if (jsx.props['style']) {
        jsx.props['style'] = styleToObj(jsx.props['style'])
    }
    // BemSimpleComponent
    if (jsx.props['attrs'] && jsx.props['attrs']['style']) {
        jsx.props['attrs']['style'] = styleToObj(jsx.props['attrs']['style'])
    }
};

var isChar = (c) => c && c.toLowerCase() !== c.toUpperCase();

module.exports.keepWhiteSpaces = () => function keepWhiteSpaces(jsx) {
    if(!jsx.isText || jsx.isProp) { return; }

    for(var i = 0; i < jsx.simpleVal.length; i++) {
        if(!isChar(jsx.simpleVal[i])) {
            jsx.simpleVal = `{${valToStr(jsx.simpleVal)}}`;
            return;
        }
    }
};

module.exports.defaultPlugins = [
    module.exports.keepWhiteSpaces,
    module.exports.copyMods,
    module.exports.copyTag,
    module.exports.copyAttrs,
    module.exports.processMixElemMods,
    module.exports.processJsParams,
    module.exports.copyCustomFields,
    module.exports.camelCaseProps,
    module.exports.stylePropToObj
];

module.exports.whiteList = options => {
    options = options || {};

    return function(jsx) {
        if (options.entities && jsx.bemEntity) {
            if (!options.entities.some(white => jsx.bemEntity.isEqual(white))) {
                return '';
            }
        }
    };
};
