var pascalCase = require('pascal-case');

var reactMappings = require('./reactMappings');
var valToStr = require('./helpers').valToStr;

function JSXNode(tag, props, children) {
    this.tag = tag || 'div';
    this.props = props || {};
    this.children = children || [];
    this.bemEntity = null;
    this.isJSON = false;
    this.isSimple = false;
    this.isText = false;
    this.simpleVal = undefined;
}

var propsToStr = props => Object.keys(props).reduce((acc, k) => {
    if (typeof props[k] === 'string') {
        return acc + ` ${k}=${valToStr(props[k])}`
    } else {
        return acc + ` ${k}={${valToStr(props[k])}}`
    }
}, '');

var tagToClass = tag => reactMappings[tag] ? tag : pascalCase(tag);

JSXNode.prototype.toString = function() {
    if (this.isText) {
        return this.simpleVal;
    }
    if (this.isSimple) {
        return this.simpleVal;
    }
    if (this.isJSON) {
        return valToStr(this.props);
    }

    var tag = tagToClass(this.tag);
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
module.exports.tagToClass = tagToClass;
