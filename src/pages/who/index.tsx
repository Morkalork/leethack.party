import React from "react";
import {isLandscape} from '../../utils/is-landscape';

import './index.scss';
import landscape from '../../assets/images/crew_landscape.jpg';
import portrait from '../../assets/images/crew_portrait.jpg';
import {Image} from "../../components/image";
import {MetaData} from "../../components/meta-data";

export const Who = () => {
    const image = isLandscape() ? landscape : portrait;
    return <div className='who'>
        <MetaData title={'Who are we?'} description={'Who are in the elusive LeetHack team?!'}/>
        <section>
            <header>
                <h1>Who are in the elusive LeetHack team?</h1>
            </header>
            <p>Well, we're just a ragtag, up-to-no-good jolly bunch of developers with nothing better to do than waste our time on this.</p>
            <p>We like to meet up and code, we hope you like to meet up and code, and maybe through the magical venture
                of LeetHack, <strong>We</strong> can meet up and code, together!</p>
        </section>
        <section>
            <Image image={image} caption={'Otto Remse, Mikael Brassman and Magnus Ferm - The LeetHack Crew!'}/>
        </section>
    </div>;
}