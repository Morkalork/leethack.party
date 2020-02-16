import React from "react";
import {MetaData} from "../../components/meta-data";

export const When = () => {
    return <div className='when'>
        <MetaData title='When are LeetHack events hosted?' description='Keep up to date with the latest dates!'/>
        <section>
            <header>
                <h1>When do you host LeetHack events?</h1>
            </header>
            <p>We don't know and we don't really have a good line of communications for this. Keep an eye out for news at the twitter account of <a
                    href='https://twitter.com/tretton37'>tretton37</a>, they might know. You can also try our account,<a
                    href='https://twitter.com/leethackparty'>LeetHack Party</a>, we might now too!</p>
        </section>
        <section>
            <p>But really, it's anyone's guess!</p>
        </section>
    </div>;
}