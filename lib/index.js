var BemEntity = require('@bem/sdk.entity-name');

var {
    JSXTextNode,
    JSXSimpleNode,
    JSXJSONNode,
    JSXComponentNode,
    JSXBEMComponentNode,
    JSXBEMSimpleComponentNode
} = require('./JSXNode');
var plugins = require('./plugins');

function Transformer(options) {
    this.plugins = [];
    this.use(plugins.defaultPlugins.map(plugin => plugin()));
    this._opts = { isNameSpacedElems: Boolean(options.isNameSpacedElems) };

    this.knowComponents = [].concat(options.knowComponents || []);
    this.useSimpleComponent = Boolean(options.useSimpleComponent) || Boolean(options.knowComponents);
}

var checkKnown = (knowComponents, bemEntity) => knowComponents.some(knowEntity => knowEntity.isEqual(bemEntity));

Transformer.prototype.process = function(bemjson) {
    var nodes = [{
        json: bemjson,
        id: 0,
        blockName: '',
        tree: []
    }];
    var root = nodes[0];

    var node;

    while((node = nodes.shift())) {
        var json = node.json, i;

        if (Array.isArray(json)) {
            for (i = 0; i < json.length; i++) {
                nodes.push({
                    json: json[i],
                    id: i,
                    tree: node.tree,
                    blockName: node.blockName,
                    customField: node.customField
                });
            }
        } else {
            var res = undefined;
            var jsx = undefined;
            var blockName = json.block || node.blockName;

            switch (typeof json) {
                case 'number':
                case 'boolean':
                    jsx = new JSXSimpleNode({ simpleVal: json,  opts: this._opts, isProp: node.customField });
                break;

                case 'string':
                    jsx = new JSXTextNode({ text: json,  opts: this._opts, isProp: node.customField });
                break;

                default:
                    if (json.block || json.elem) {
                        var bemEntity = new BemEntity({ block: blockName, elem: json.elem });

                        if (
                            this.useSimpleComponent === false ||
                            checkKnown(this.knowComponents, bemEntity)
                        ) {
                            jsx = new JSXBEMComponentNode({
                                bemEntity: bemEntity,
                                opts: this._opts,
                                isProp: node.customField
                            });
                        } else {
                            jsx = new JSXBEMSimpleComponentNode({
                                bemEntity: bemEntity,
                                opts: this._opts,
                                isProp: node.customField
                            });
                        }

                    } else if (json.content || json.attrs || json.tag || json.hasOwnProperty('cls')) {
                        jsx = new JSXComponentNode({ tag: json.tag, opts: this._opts, isProp: node.customField });
                    } else {
                        jsx = new JSXJSONNode({ json: json, opts: this._opts, isProp: node.customField });
                    }
                break;
            }

            for (i = 0; i < this.plugins.length; i++) {
                var plugin = this.plugins[i];
                res = plugin(jsx, jsx.isSimple ? json : Object.assign({ block: blockName }, json));
                if (res !== undefined) {
                    json = res;
                    node.json = json;
                    node.blockName = blockName;
                    nodes.push(node);
                    break;
                }
            }

            // Nested JSX in custom fields
            if (!jsx.isSimple) {
                for (var key in json) {
                    if (!~['mix', 'content', 'attrs', 'block', 'elem', 'mods', 'elemMods', 'tag', 'js'].indexOf(key)) {
                        var prop = jsx.props[key];
                        if (typeof prop === 'object') {
                            if (Array.isArray(prop)) {
                                nodes.push({ json: prop, id: key, tree: prop, blockName, customField: true });
                            } else {
                                nodes.push({ json: prop, id: key, tree: jsx.props, blockName, customField: true });
                            }
                        }
                    }
                }
            }

            if (res === undefined) {
                var content = json.content;
                if (content) {
                    if (Array.isArray(content)) {
                        // content: [[[{}, {}, [{}]]]]
                        var flatten;
                        do {
                            flatten = false;
                            for (i = 0; i < content.length; i++) {
                                if (Array.isArray(content[i])) {
                                    flatten = true;
                                    break;
                                }
                            }
                            if (flatten) {
                                json.content = content = content.concat.apply([], content);
                            }
                        } while (flatten);

                        for (i = 0; i < content.length; i++) {
                            nodes.push({ json: content[i], id: i, tree: jsx.children, blockName: blockName });
                        }
                    } else {
                        nodes.push({ json: content, id: 'children', tree: jsx, blockName: blockName });
                    }
                } else {
                    jsx.children = undefined;
                }
            }

            node.tree[node.id] = jsx;
        }
    }

    return {
        bemjson: root.json,
        tree: root.tree,
        get JSX() {
            return render(root.tree);
        }
    };
};

Transformer.prototype.use = function() {
    this.plugins = [].concat.apply(this.plugins, arguments)
    return this;
};

function render(tree) {
    return tree.join('\n');
}

Transformer.prototype.Transformer = Transformer;

module.exports = function(opts) {
    return new Transformer(opts || {});
};

module.exports.plugins = plugins;
