import React from 'react';
import {Pictures} from "./pictures";
import {MetaData} from "../../components/meta-data";

export const What = () => {
    return <div className='what'>
        <MetaData title={'What is LeetHack?'} description={'This page will tell you everything you have ever wanted to know about LeetHack!'} />
        <section>
            <header>
                <h1>So, what's this then?</h1>
            </header>
            <p>LeetHack Party, a developer fest for people with nothing better to do!</p>
            <p>Challenge yourself with code, pick your own brain with puzzles and dive deep into a game developed
                specifically for code junkies.</p>
        </section>
        <section>
            <p>This game has been challenged by brave knights and knightesses wielding the sword of C#, the javelin of
                JavaScript, the pike of Python and (rather unfortunately) the epa-tractor that is Excel/VBA.</p>
        </section>
        <section>
            <Pictures/>
        </section>
    </div>
}