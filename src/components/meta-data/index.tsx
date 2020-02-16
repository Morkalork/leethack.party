import React from 'react';
import MetaTags from 'react-meta-tags';

interface Props {
    title: string,
    description: string,
}

export const MetaData = (props: Props) => <MetaTags>
    <title>{props.title}</title>
    <meta name='description' content={props.description}/>
</MetaTags>