var pascalCase = require('pascal-case');

var reactMappings = require('./reactMappings');
var valToStr = require('./helpers').valToStr;

var propsToStr = props => Object.keys(props).reduce((acc, k) => {
    if (typeof props[k] === 'string') {
        return acc + ` ${k}=${valToStr(props[k])}`;
    } else if (props[k] === true) {
        return acc + ` ${k}`;
    } else {
        return acc + ` ${k}={${valToStr(props[k])}}`;
    }
}, '');


class JSXNode {
    constructor({ props, children, opts, isProp }) {
        this.opts = opts;
        this.isProp = Boolean(isProp);

        this.props = props || {};
        this.children = children || [];
    }
}

class JSXSimpleNode extends JSXNode {
    constructor(args) {
        super(args);
        this.simpleVal = args.simpleVal;
        this.isSimple = true;
    }

    toString() {
        return this.simpleVal;
    }
}

class JSXTextNode extends JSXSimpleNode {
    constructor(args) {
        args.simpleVal = args.text;
        super(args);

        this.text = args.text;
        this.isText = true;
    }

    toString() {
        if (this.isProp) {
            return `'${super.toString()}'`;
        } else {
            return super.toString();
        }
    }
}

class JSXJSONNode extends JSXNode {
    constructor(args) {
        super(args);
        this._json = args.json;
        this.isJSON = true;
    }

    toString() {
        return valToStr(Object.keys(this._json).reduce((acc, k) => {
            acc[k] = this.props[k] || this._json[k];
            return acc;
        }, {}));
    }
}

class _JSXComponent extends JSXNode {
    constructor(args) {
        super(args);
    }

    tagToClass() {
        return 'div';
    }

    toString() {
        var jsxTag = this.tagToClass();

        var children = [].concat(this.children)
            .filter(Boolean)
            // remove empty text nodes
            .filter(child => !(child.isText && child.simpleVal === ''));

        var str = children.length ?
            `<${jsxTag}${propsToStr(this.props)}>\n${children.join('\n')}\n</${jsxTag}>` :
            `<${jsxTag}${propsToStr(this.props)}/>`;
        return str;
    }
}

class JSXComponentNode extends _JSXComponent {
    constructor({ tag, props, children, opts, isProp }) {
        super({ opts, isProp, props, children });

        this.tag = tag;
        this.isComponent = true;
    }

    tagToClass() {
        return reactMappings.tags[this.tag] || super.tagToClass();
    }
}

class JSXBEMComponentNode extends _JSXComponent {
    constructor(args) {
        super(args);

        this.bemEntity = args.bemEntity;

        this.isBEMComponent = true;
    }

    tagToClass() {
        const { block, elem } = this.bemEntity;
        return elem && this.opts.isNameSpacedElems ?
            `${pascalCase(block)}.${pascalCase(elem)}` :
            pascalCase(this.bemEntity.toString());
    }
}

class JSXBEMSimpleComponentNode extends JSXBEMComponentNode {
    constructor(args) {
        super(args);

        this.isBEMSimpleComponent = true;
    }

    tagToClass() {
        return 'Bem';
    }

    toString() {
        this.bemEntity && (this.props = Object.assign({}, this.bemEntity.valueOf(), this.props));
        return super.toString();
    }
}

module.exports = {
    JSXNode,
    JSXTextNode,
    JSXSimpleNode,
    JSXJSONNode,
    JSXComponentNode,
    JSXBEMComponentNode,
    JSXBEMSimpleComponentNode
};
