var bn = require('@bem/naming');
var BemEntity = require('@bem/entity-name');

var styleToObj = require('./helpers').styleToObj;
var JSXNode = require('./JSXNode');
var plugins = require('./plugins');

function Transformer(options) {
    this.plugins = [];
    this.use(plugins.defaultPlugins.map(plugin => plugin()));
    this.bemNaming = bn(options.naming || 'react');
}

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
                nodes.push({ json: json[i], id: i, tree: node.tree, blockName: node.blockName });
            }
        } else {
            var res = undefined;
            var jsx = new JSXNode();
            var blockName = json.block || node.blockName;

            switch (typeof json) {
                case 'string':
                    jsx.isText = true;
                case 'number':
                case 'boolean':
                    jsx.isSimple = true;
                    jsx.simpleVal = json;
                break;

                default:
                    if (json.tag) {
                        jsx.tag = json.tag;
                    } else if (json.block || json.elem) {
                        jsx.bemEntity = new BemEntity({ block: blockName, elem: json.elem });
                        jsx.tag = this.bemNaming.stringify(jsx.bemEntity);
                    } else if (!json.content) {
                        jsx.isJSON = true;
                    }
                break;
            }


            for (i = 0; i < this.plugins.length; i++) {
                var plugin = this.plugins[i];
                res = plugin(jsx, Object.assign({ block: blockName }, json));
                if (res !== undefined) {
                    json = res;
                    node.json = json;
                    node.blockName = blockName;
                    nodes.push(node);
                    break;
                }
            }

            // Nested JSX in custom fields
            for (var key in json) {
                if (!~['mix', 'content', 'attrs', 'block', 'elem', 'mods', 'elemMods', 'tag', 'js'].indexOf(key)) {
                    var prop = jsx.props[key];
                    if (typeof prop === 'object') {
                        if (Array.isArray(prop)) {
                            nodes.push({ json: prop, id: key, tree: prop, blockName: blockName });
                        } else {
                            nodes.push({ json: prop, id: key, tree: jsx.props, blockName: blockName });
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

module.exports.tagToClass = JSXNode.tagToClass;
module.exports.plugins = plugins;
module.exports.styleToObj = styleToObj;
