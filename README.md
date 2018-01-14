bemjson-to-jsx
==============

Transforms BEMJSON objects to JSX markup.

[![NPM Status][npm-img]][npm]
[![Travis Status][test-img]][travis]
[![Coverage Status][coverage-img]][coveralls]
[![Dependency Status][dependency-img]][david]

[npm]:            https://www.npmjs.org/package/bemjson-to-jsx
[npm-img]:        https://img.shields.io/npm/v/bemjson-to-jsx.svg

[travis]:         https://travis-ci.org/bem-sdk-archive/bemjson-to-jsx
[test-img]:       https://img.shields.io/travis/bem-sdk-archive/bemjson-to-jsx.svg?label=tests

[coveralls]:      https://coveralls.io/r/bem-sdk/bemjson-to-jsx
[coverage-img]:   https://img.shields.io/coveralls/bem-sdk/bemjson-to-jsx.svg

[david]:          https://david-dm.org/bem-sdk/bemjson-to-jsx
[dependency-img]: http://img.shields.io/david/bem-sdk/bemjson-to-jsx.svg

Install
-------

```
$ npm install --save bemjson-to-jsx
```

Usage
-----

```js
const bemjsonToJSX = require('bemjson-to-jsx')();

var bemjson = {
    block: 'button2',
    mods: { theme: 'normal', size: 'm' },
    text: 'hello world'
};

var jsxTree = bemjsonToJSX.process(bemjson);

console.log(jsxTree.JSX);
// → "<Button2 theme={'normal'} size={'m'} text={'hello world'}/>"
```

## Options

### isNameSpacedElems

`isNameSpacedElems` Change generation of JSX Class

* `true` — Block.Elem
* `false` — BlockElem ( default )

```js
const bemjsonToJSX = require('bemjson-to-jsx')({ isNameSpacedElems: true });

var bemjson = {
    block: 'button2',
    elem: 'text'
    text: 'hello world'
};

var jsxTree = bemjsonToJSX.process(bemjson);

console.log(jsxTree.JSX);
// → "<Button2.Text text={'hello world'}/>"
```

### useSimpleComponent

`useSimpleComponent` Is flag to enable `<Bem />` components in JSX.
Check [bem-react-core](https://bem.gitbooks.io/bem-react-core/en/Basics/BEMComponent.html), for more information about Bem Simple Component.

* `true` — enables <BEM />
* `false` — ( default )

By default all components rendered as they has class defined somewhere.

```js
const bemjsonToJSX = require('bemjson-to-jsx')({ useSimpleComponent: false });

var bemjson = {
    block: 'button2',
    text: 'hello world'
};

var jsxTree = bemjsonToJSX.process(bemjson);

console.log(jsxTree.JSX);
// → "<Button2 text={'hello world'}/>"
```

Enabling `<Bem />`, components that have `block` or `block & elem` fields turns to `<Bem />` components.
If bemsjon of components does'n t contain `block` or `block & elem` field,
we treat them as simple JSX — `<div />`, `<span />`, `<button />` and so on.


```js
const bemjsonToJSX = require('bemjson-to-jsx')({ useSimpleComponent: true });

var bemjson = {
    tag: 'span',
    content: [
        { block: 'button2', text: 'hello' },
        { block: 'textinput', text: 'world' }
    ]
};

var jsxTree = bemjsonToJSX.process(bemjson);

console.log(jsxTree.JSX);
// → "<span>
//      <Bem block="button2" text="hello"/>
//      <Bem block="textinput" text="world"/>
//   </span>"
```

### knownComponents

For enabling `<Bem /> on some components. Provide Array of [bem-entity](https://www.npmjs.com/package/@bem/sdk.entity-name) to knownComponents.
Then known entities will be components and unkown will be `<Bem />`.
These option also enables `useSimpleComponent = true`.

* `[BemEntity]` — array of known entities. Also could be single `BemEntity`.

```js
const BemEntity = require('@bem/sdk.entity-name');

const bemjsonToJSX = require('bemjson-to-jsx')({
    knownComponents: BemEntity.create({ block: 'button2' })
});

var bemjson = {
    tag: 'span',
    content: [

        // button2 is known
        { block: 'button2', text: 'hello' },

        // textinput would be <Bem />
        { block: 'textinput', text: 'world' }
    ]
};

var jsxTree = bemjsonToJSX.process(bemjson);

console.log(jsxTree.JSX);
// → "<span>
//      <Button2 text="hello"/>
//      <Bem block="textinput" text="world"/>
//   </span>"
```
