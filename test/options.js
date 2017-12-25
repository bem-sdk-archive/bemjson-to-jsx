var expect = require('chai').expect;
var BemEntity = require('@bem/sdk.entity-name');

var T = require('../lib');

describe('isNameSpacedElems', () => {

    var tt = T({ isNameSpacedElems: true });
    var transform = tt.process.bind(tt);

    it('Block', () => {
        expect(
            transform([
                { tag: 'span', content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'button2', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<span>\n<Button2 text="hello"/>\n<Button2 text="world"/>\n</span>`);
    });

    it('Elem', () => {
        expect(
            transform({ block: 'button2', elem: 'text', content: 'Hello'  }).JSX
        ).to.equal(`<Button2.Text>\nHello\n</Button2.Text>`);
    });

    it('Block with Elem', () => {
        expect(
            transform({ block: 'button2', content: { elem: 'text', content: 'Hello' } }).JSX
        ).to.equal(`<Button2>\n<Button2.Text>\nHello\n</Button2.Text>\n</Button2>`);
    });

});

describe('known components', () => {

    it('Block', () => {
        expect(
            T({ knowComponents: BemEntity.create({ block: 'button2' }) }).process([
                { tag: 'span', content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'textinput', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<span>\n<Button2 text="hello"/>\n<BEM block="textinput" text="world"/>\n</span>`);
    });

    it('Elem', () => {
        expect(
            T({ knowComponents: BemEntity.create({ block: 'button2', elem: 'text' }) }).process([
                { tag: 'span', content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'button2', content: { elem: 'text', content: 'hello' } },
                    { block: 'button2', elem: 'text', content: 'hello' },
                    { block: 'textinput', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<span>` +
            `\n<BEM block="button2" text="hello"/>` +
            `\n<BEM block="button2">` +
            `\n<Button2Text>` +
            `\nhello` +
            `\n</Button2Text>` +
            `\n</BEM>` +
            `\n<Button2Text>` +
            `\nhello` +
            `\n</Button2Text>` +
            `\n<BEM block="textinput" text="world"/>` +
            `\n</span>`
        );
    });

    it('Mod', () => {
        expect(
            T({ knowComponents: BemEntity.create({ block: 'button2' }) }).process([
                { tag: 'span', content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'button2', mods: { type: 'link' }, text: 'hello' },
                    { block: 'button2', mods: { type: 'action' }, text: 'hello' },
                    { block: 'button2', mods: { type: true }, text: 'hello' },
                    { block: 'textinput', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<span>` +
        `\n<Button2 text="hello"/>` +
        `\n<Button2 type="link" text="hello"/>` +
        `\n<Button2 type="action" text="hello"/>` +
        `\n<Button2 type text="hello"/>` +
        `\n<BEM block="textinput" text="world"/>` +
        `\n</span>`);
    });

});
