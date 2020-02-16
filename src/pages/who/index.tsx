import React from "react";
import {isLandscape} from '../../utils/is-landscape';

import './index.scss';
import landscape from '../../assets/images/crew_landscape.jpg';
import portrait from '../../assets/images/crew_portrait.jpg';
import {Image} from "../../components/image";

export const Who = () => {
    const image = isLandscape() ? landscape : portrait;
    return <div className='who'>
        <section>
            <p>"<em>Who are we that have created this?</em>" we hear you ask. Well, we're just a ragtag jolly bunch of developers
                with nothing better to do than waste our time on this.</p>
            <p>We like to meet up and code, we hope you like to meet up and code, and maybe through the magical venture
                of LeetHack, <strong>We</strong> can meet up and code, together!</p>
        </section>
        <section>
            <Image image={image} caption={'Otto Remse, Mikael Brassman and Magnus Ferm - The LeetHack Crew!'}/>
        </section>
    </div>;
}