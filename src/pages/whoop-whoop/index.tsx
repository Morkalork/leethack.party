import React from "react";
import {MetaData} from "../../components/meta-data";

export const WhoopWhoop = () => {
    return <div className='whoop-whoop'>
        <MetaData title='Contact us' description='Do you really want to contact us? Think about it...' />
        <section>
            <header>
                <h1>???</h1>
            </header>
            <p>"Whoop whoop" indeed! If you want to come in contact with us, please use <a
                href='https://twitter.com/leethackparty'>Twitter</a> or create an issue at <a
                href='https://github.com/Morkalork/leethack.party'>the repository for this page</a>.</p>
        </section>
    </div>;
}