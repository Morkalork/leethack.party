import React from "react";
import {MetaData} from "../../components/meta-data";

export const Why = () => {
    return <div className='why'>
        <MetaData title='Whyy...' description='Let us go all philosophical on our own asses...' />
        <section>
            <header>
                <h1>Why are we doing this?!</h1>
            </header>
            <p>Why is there a LeetHack? We've asked ourselves that very question zero times. LeetHack was created to fill a void in our life, a programming challenge that requested no valid end product and no purpose other than to solve puzzles with code.</p>
            <p>LeetHack is made by developers, for developers to let you test your skills in a time boxed, competitive environment without words like "agile" or "quality assurance".</p>
        </section>
        <section>
            <p>It's just for fun! ❤</p>
        </section>
    </div>;
}