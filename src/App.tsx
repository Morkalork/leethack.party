import React from 'react';
import './App.scss';
import {Header} from "./components/header";
import {LeetRouter} from "./router";

const App = () => {
    return (
        <div className="App">
            <Header/>
            <div className='content'>
                <LeetRouter/>
            </div>
        </div>
    );
};

export default App;
