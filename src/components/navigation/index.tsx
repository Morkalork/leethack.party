import React from 'react';
import './index.scss';
import {Link} from "react-router-dom";
import {withRouter} from 'react-router-dom';

interface Props {
    location: {
        pathname: string
    }
};

const pathInfo = [{
    path: '/',
    text: 'What'
}, {
    path: '/when',
    text: 'When'
}, {
    path: '/where',
    text: 'Where'
}, {
    path: '/why',
    text: 'Why'
}, {
    path: '/who',
    text: 'Who'
}, {
    path: '/whoop-whoop',
    text: 'Whoop whoop'
}];

const getPaths = (currentPath: string) => pathInfo.map((info) => ({
    path: info.path,
    text: info.text,
    selected: info.path === currentPath
}))

export const Navigation = withRouter((props: Props) => {
    const paths = getPaths(props.location.pathname);
    return <nav>
        <ul>
            {paths.map((path) => <li key={path.path}>
                <Link to={path.path} className={path.selected ? 'selected' : ''}>
                    {path.text}
                </Link>
            </li>)}
        </ul>
    </nav>
});