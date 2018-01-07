var expect = require('chai').expect;

var transformer = require('../lib')();
var transform = transformer.process.bind(transformer);

describe('transform', () => {

    it('should return string', () => {
        expect(transform({ block: 'button2' }).JSX).to.be.a('String');
    });

    it('should accept object', () => {
        expect(() => transform({ tag: 'span' }).JSX).not.to.throw();
    });

    it('should accept array', () => {
        expect(() => transform([{ tag: 'span' }]).JSX).not.to.throw();
    });

    it('should transform block', () => {
        expect(
            transform({ block: 'button2' }).JSX
        ).to.equal(
            '<Button2/>'
        );
    });

    describe('props', () => {
        it('should transform block with string prop', () => {
            expect(
                transform({ block: 'button2', text: 'hello' }).JSX
            ).to.equal(
                '<Button2 text="hello"/>'
            );
        });

        it('should transform block with bool prop', () => {
            expect(
                transform({ block: 'button2', text: true}).JSX
            ).to.equal(
                '<Button2 text/>'
            );
        });

        it('should transform block with number prop', () => {
            expect(
                transform({ block: 'button2', text: 42}).JSX
            ).to.equal(
                '<Button2 text={42}/>'
            );
        });

        it('should transform block with array prop', () => {
            expect(
                transform({
                    block: 'select2',
                    val: 1,
                    items: [ { val: 1 }, { val: 2 } ]
                }).JSX
            ).to.equal(
                `<Select2 val={1} items={[{ 'val': 1 }, { 'val': 2 }]}/>`
            );
        });

        it('should transform block with object prop', () => {
            expect(
                transform({ block: 'button2', text: 'hello', val: { 42: 42 } }).JSX
            ).to.equal(
                '<Button2 text="hello" val={{ \'42\': 42 }}/>'
            );
        });

        it('should transform block with nested object prop', () => {
            expect(
                transform({ block: 'button2', text: 'hello', val: { 42: { 42: 42 } } }).JSX
            ).to.equal(
                '<Button2 text="hello" val={{ \'42\': { \'42\': 42 } }}/>'
            );
        });

        it('should transform blocks with kebab-case propName', () => {
            expect(
                transform({
                    block: 'select2',
                    mods: {
                        'with-icon': 'yes',
                        'item-icon-hidden': 'yes-yes'
                    },
                    'prop-icon': 'one',
                    'prop-icon-hidden': 'one-two'
                }).JSX
            ).to.equal(
                '<Select2 withIcon="yes" itemIconHidden="yes-yes" propIcon="one" propIconHidden="one-two"/>'
            );
        });
    });

    it('should transform several blocks', () => {
        expect(
            transform([
                { block: 'button2', text: 'hello' },
                { block: 'button2', text: 'world' }
            ]).JSX
        ).to.equal(`<Button2 text="hello"/>\n<Button2 text="world"/>`);
    });

    it('should content with several blocks', () => {
        expect(
            transform([
                { content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'button2', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<div>\n<Button2 text="hello"/>\n<Button2 text="world"/>\n</div>`);
    });

    it('should tag with several blocks', () => {
        expect(
            transform([
                { tag: 'span', content: [
                    { block: 'button2', text: 'hello' },
                    { block: 'button2', text: 'world' }
                ]}
            ]).JSX
        ).to.equal(`<span>\n<Button2 text="hello"/>\n<Button2 text="world"/>\n</span>`);
    });

    it('should content with several blocks inside nested arrays', () => {
        expect(
            transform([[
                { tag: 'span', content: [
                    [[{ block: 'button2', text: 'hello' }]],
                    { block: 'button2', text: 'world' }
                ]}
            ],[]]).JSX
        ).to.equal(`<span>\n<Button2 text="hello"/>\n<Button2 text="world"/>\n</span>`);
    });

    it('should transform elem in context of block', () => {
        expect(
            transform({ block: 'button2', content: { elem: 'text', content: 'Hello' } }).JSX
        ).to.equal(`<Button2>\n<Button2Text>\nHello\n</Button2Text>\n</Button2>`);
    });

    it('should treat mods as props', () => {
        expect(
            transform({ block: 'button2', mods: { theme: 'normal', size: 's' } }).JSX
        ).to.equal(`<Button2 theme="normal" size="s"/>`);
    });

    it('should provide mix as obj', () => {
        expect(
            transform({ block: 'button2', mix: { block: 'header', elem: 'button' } }).JSX
        ).to.equal(`<Button2 mix={{ 'block': "header", 'elem': "button" }}/>`);
    });

    it('should provide custom prop with block as jsx', () => {
        expect(
            transform({ block: 'button2', custom: { block: 'header', elem: 'button' } }).JSX
        ).to.equal(`<Button2 custom={<HeaderButton/>}/>`);
    });

    it('should provide custom prop with elem as jsx', () => {
        expect(
            transform({ block: 'button2', custom: { elem: 'text' } }).JSX
        ).to.equal(`<Button2 custom={<Button2Text/>}/>`);
    });

    it('should provide custom prop[] as jsx', () => {
        expect(
            transform({
                block: 'button2',
                custom: [
                    42,
                    true,
                    { val: 42 },
                    'Hello\u0020world',
                    { block: 'header', elem: 'button' },
                    { elem: 'text', text: 'hello' }
                ]
            }).JSX
        ).to.equal(`<Button2 custom={[42, true, { 'val': 42 }, 'Hello world', <HeaderButton/>, <Button2Text text="hello"/>]}/>`);
    });

    it('should provide custom with nested blocks as jsx', () => {
        expect(
            transform({
                block: 'menu2',
                items: [
                    { icon: { block: 'icon', mods: { type: 'kz' } } }
                ]
            }).JSX
        ).to.equal(`<Menu2 items={[{ 'icon': <Icon type="kz"/> }]}/>`);
    });

    it('should provide custom with nested arrays and blocks as jsx', () => {
        expect(
            transform({
                block: 'buttonator',
                items: [
                    [{block: 'button1'}, {block: 'popup1'}],
                    [{block: 'button2'}, {block: 'popup2'}],
                    [{block: 'button3'}, {block: 'popup3'}]
                ]
            }).JSX
        ).to.equal(`<Buttonator items={[[<Button1/>, <Popup1/>], [<Button2/>, <Popup2/>], [<Button3/>, <Popup3/>]]}/>`);
    });

    it('should provide custom prop with mods as json', () => {
        expect(
            transform({
                block: 'menu2',
                items: [
                    { icon: { mods: { type: 'kz' }, elemMods: { type: 'ru' } } }
                ]
            }).JSX
        ).to.equal(`<Menu2 items={[{ 'icon': { 'mods': { 'type': "kz" }, 'elemMods': { 'type': "ru" } } }]}/>`);
    });

    it('should treat strings as text', () => {
        expect(
            transform(['Hello\u0020I am a string', { block: 'button2', content: 'Hello I am a string' }]).JSX
        ).to.equal(`{"Hello I am a string"}\n<Button2>\n{"Hello I am a string"}\n</Button2>`);
    });
});
