var pascalCase = require('pascal-case');

var reactMappings = require('./reactMappings');
var valToStr = require('./helpers').valToStr;

function JSXNode({ tag, props, children, opts }) {
    this.tag = tag || 'div';
    this.props = props || {};
    this.children = children || [];
    this.bemEntity = null;
    this.isJSON = false;
    this._json = {};
    this.isSimple = false;
    this.isText = false;
    this.simpleVal = undefined;
    this.opts = opts;
}

var propsToStr = props => Object.keys(props).reduce((acc, k) => {
    if (typeof props[k] === 'string') {
        return acc + ` ${k}=${valToStr(props[k])}`
    } else {
        return acc + ` ${k}={${valToStr(props[k])}}`
    }
}, '');

JSXNode.prototype.tagToClass = function() {
    const { block, elem } = this.bemEntity;
    return elem && this.opts.isNameSpacedElems ?
        `${pascalCase(block)}.${pascalCase(elem)}` :
        pascalCase(this.tag);
};

JSXNode.prototype.toString = function() {
    if (this.isText) {
        return this.simpleVal;
    }
    if (this.isSimple) {
        return this.simpleVal;
    }
    if (this.isJSON) {
        // TODO: actually we need jsx-to-bemjson transform here >__<
        return valToStr(Object.keys(this._json).reduce((acc, k) => {
            acc[k] = this.props[k] || this._json[k];
            return acc;
        }, {}));
    }

    var tag = reactMappings[this.tag] ? this.tag : this.tagToClass();
    var children = [].concat(this.children)
        .filter(Boolean)
        // remove empty text nodes
        .filter(child => !(child.isText && child.simpleVal === ''));

    var str = children.length ?
        `<${tag}${propsToStr(this.props)}>\n${children.join('\n')}\n</${tag}>` :
        `<${tag}${propsToStr(this.props)}/>`;
    return str;
};

module.exports = JSXNode;
