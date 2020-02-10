import React from 'react';
import './index.scss';
import {Link} from "react-router-dom";

export const Navigation = () => {
    return <nav>
        <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/when'>When?</Link></li>
        </ul>
    </nav>
}