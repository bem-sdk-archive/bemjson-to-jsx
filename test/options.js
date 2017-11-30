const expect = require('chai').expect;

var transformer = require('../lib')({ isNameSpacedElems: true });
var transform = transformer.process.bind(transformer);

describe('isNameSpacedElems', () => {

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
