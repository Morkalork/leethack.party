import React from 'react';
import './index.scss';

interface Props {
    image: any,
    caption: string
}

export const Image = (props: Props) => {
    return <figure>
        <a href={props.image} target='_blank' rel="noopener noreferrer">
            <img src={props.image} alt={props.caption}/>
        </a>
        <figcaption>{props.caption}</figcaption>
    </figure>
};