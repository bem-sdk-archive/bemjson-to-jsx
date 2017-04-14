import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import BemjsonToJSX from 'bemjson-to-jsx';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jsx: `<Button text='Hello world' />`,
        }

        this.onBemjsonChange = this.onBemjsonChange.bind(this);
    }
    onBemjsonChange(newValue, e) {
        try {
            debugger;
            var bemjson = eval(newValue);
            var jsx = BemjsonToJSX().process(bemjson).JSX
            this.setState({jsx});
        } catch (err) {}
    }
    render() {
        const options = {
             scrollBeyondLastLine: false
        };
        const code =
`({
    block: 'button',
    text: 'Hello world'
})`;
        const jsx = this.state.jsx;
        return (
            <div className='App'>
                <span className='App__editor bemjson'>
                    <MonacoEditor {...{
                        language: 'javascript',
                        width: '50%',
                        options: options,
                        onChange: this.onBemjsonChange,
                        value: code
                    }}/>
                </span>
                <span className='App__editor jsx'>
                    <MonacoEditor {...{
                        language: 'jsx',
                        width: '50%',
                        options: options,
                        value: jsx
                    }}/>
                </span>
           </div>
       );
    }
}

export default App;
