var expect = require('chai').expect;

var transformer = require('../lib')({ useSimpleComponent: true });
var transform = transformer.process.bind(transformer);

describe('bemjson', () => {

    it('should transform bemjson with block', () => {
        expect(
            transform([{ block: 'b-page' }, { block: 'button' }]).JSX
        ).to.equal(`<Bem block="b-page"/>\n<Bem block="button"/>`);
    });

    it('should transform bemjson with elem', () => {
        expect(
            transform({ block: 'b-page', elem: 'body' }).JSX
        ).to.equal(`<Bem block="b-page" elem="body"/>`);
    });

    it('should transform bemjson with elem inside block', () => {
        expect(
            transform({ block: 'b-page', content: { elem: 'body' } }).JSX
        ).to.equal(`<Bem block="b-page">\n<Bem block="b-page" elem="body"/>\n</Bem>`);
    });

    it('should transform bemjson with elem', () => {
        expect(
            transform({ block: 'b-page', elem: 'body' }).JSX
        ).to.equal(`<Bem block="b-page" elem="body"/>`);
    });

    it('should transform bemjson with mods', () => {
        expect(
            transform({ block: 'b-page', mods: { theme: 'normal' } }).JSX
        ).to.equal(`<Bem block="b-page" mods={{ 'theme': "normal" }}/>`);
    });

    it('should transform bemjson with simple mod', () => {
        expect(
            transform({ block: 'b-page', mods: { disabled: true } }).JSX
        ).to.equal(`<Bem block="b-page" mods={{ 'disabled': true }}/>`);
    });

    it('should transform bemjson with eleMod', () => {
        expect(
            transform({
                block: 'b-page',
                elem: 'body',
                mods: { theme: 'normal'},
                elemMods: { disabled: true }
            }).JSX
        ).to.equal(`<Bem block="b-page" elem="body" mods={{ 'disabled': true }}/>`);
    });

    it('should transform bemjson with mix', () => {
        expect(
            transform({ block: 'b-page', mix: { block: 'root' } }).JSX
        ).to.equal(`<Bem block="b-page" mix={{ 'block': "root" }}/>`);
    });

    it('should transform bemjson with mix as array', () => {
        expect(
            transform({ block: 'b-page', mix: [{ block: 'root' }, { block: 'app' } ] }).JSX
        ).to.equal(`<Bem block="b-page" mix={[{ 'block': "root" }, { 'block': "app" }]}/>`);
    });

    it('should transform bemjson with mix of elem', () => {
        expect(
            transform({ block: 'b-page', mix: { block: 'root', elem: 'body' } }).JSX
        ).to.equal(`<Bem block="b-page" mix={{ 'block': "root", 'elem': "body" }}/>`);
    });

    it('should transform bemjson with mix with mod', () => {
        expect(
            transform(
                {
                  block: 'b-page',
                  mods: { m1: 'v1' },
                  mix: { mods: { m2: 'v2' } }
                }
            ).JSX
        ).to.equal(`<Bem block="b-page" mods={{ 'm1': "v1" }} mix={{ 'mods': { 'm2': "v2" } }}/>`);
    });

    // TODO provide block context to mix
    xit('TODO: should transform bemjson with mix of elem of current block', () => {
        expect(
            transform({ block: 'b-page', mix: { elem: 'body' } }).JSX
        ).to.equal(`<Bem block="b-page" mix={{ 'block': "b-page", 'elem': "body" }}/>`);
    });

    xit('TODO: js field');

    it('should transform bemjson with content', () => {
        expect(
            transform({ block: 'b-page', content: { block: 'button' } }).JSX
        ).to.equal(`<Bem block="b-page">\n<Bem block="button"/>\n</Bem>`);
    });

    it('should transform bemjson with content elem', () => {
        expect(
            transform({
                block: 'b-page',
                content: [{ elem: 'head' }, { elem: 'body' } ]
            }).JSX
        ).to.equal(
            `<Bem block="b-page">\n<Bem block="b-page" elem="head"/>\n<Bem block="b-page" elem="body"/>\n</Bem>`
        );
    });

    xit('TODO: bem field');

    it('should transform bemjson with attrs', () => {
        expect(
            transform({ block: 'b-page', attrs: { visibility: 'hidden' } }).JSX
        ).to.equal(`<Bem block="b-page" attrs={{ 'visibility': "hidden" }}/>`);
    });

    it('should transform bemjson with attrs and camelCase them', () => {
        expect(
            transform({ block: 'x-table', attrs: { colspan: 3} }).JSX
        ).to.equal(`<Bem block="x-table" attrs={{ 'colSpan': 3 }}/>`);
    });

    it('should transform bemjson with skip not valid attrs', () => {
        expect(
            transform([
            { block: 'b-page', attrs: 'hidden' },
            { block: 'b-page', attrs: ['hidden'] }
            ]).JSX
        ).to.equal(`<Bem block="b-page"/>\n<Bem block="b-page"/>`);
    });

    it('should transform bemjson with cls', () => {
        expect(
            transform({ block: 'b-page', cls:'i-ua i-ua__svg' }).JSX
        ).to.equal(`<Bem block="b-page" cls="i-ua i-ua__svg"/>`);
    });

    it('should transform bemjson with tag', () => {
        expect(
            transform({ block: 'b-page', tag:'body' }).JSX
        ).to.equal(`<Bem block="b-page" tag="body"/>`);
    });

    xit('TODO: tag=false');

    it('should transform bemjson with custom fields', () => {
        expect(
            transform({
                block: 'link',
                url: '/',
                target: '_blank'
            }).JSX
        ).to.equal(`<Bem block="link" url="/" target="_blank"/>`);
    });

    describe('partial bemjson', () => {
        it('should transform bemjson with content only', () => {
            expect(
                transform({ content: 'Hello' }).JSX
            ).to.equal(`<div>\nHello\n</div>`);
        });

        it('should transform bemjson with tag only', () => {
            expect(
                transform({ tag: 'br' }).JSX
            ).to.equal(`<br/>`);
        });

        it('should transform bemjson with attrs only', () => {
            expect(
                transform({ attrs: { visibility: 'hidden'} }).JSX
            ).to.equal(`<div visibility="hidden"/>`);
        });

        xit('should transform bemjson with cls only', () => {
            expect(
                transform({ cls: 'hey' }).JSX
            ).to.equal(`<div className='hey'/>`);
        });
    });

});
