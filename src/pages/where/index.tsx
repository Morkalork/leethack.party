import React from "react";
import {MetaData} from "../../components/meta-data";

export const Where = () => {
    return <div className='where'>
        <MetaData title='Where do we host our events?'
                  description='Well, where do we have our events and where have we been? Learn moar!'/>
        <section>
            <header>
                <h1>Where do we host our events?</h1>
            </header>
            <p>Where have we been before? Well we've been there and back again. We've held events in Lund, Helsingborg
                and Malmö, we've been to Berlin and Riga, we've even been to Ljubljana and Stockholm!</p>
            <p>Sometimes the events have been public, sometimes closed for invite. There have been times where we've
                been eighty
                people, some times only five.</p>
        </section>
        <section>
            <p>If you feel that we haven't been where you're at, or that you've missed us when we were, give us a holler
                on <a
                    href='https://twitter.com/leethackparty'>Twitter</a> and let's talk about it ;)</p>
        </section>
    </div>;
}