import React from 'react';
import './pictures.scss';
import SimpleRoom from '../../assets/screenshots/simple-room.jpg';
import StartRoom from '../../assets/screenshots/start-room.jpg';

const data = [{
    pic: StartRoom,
    text: 'The Lobby, where the game begins...'
}, {
    pic: SimpleRoom,
    text: 'The Hallway, a room with a puzzling puzzle to solve...'
}]

export const Pictures = () => (<div className='pictures'>
    <header>
        <h3>Pictures</h3>
    </header>
    {data.map((d, index) => <figure key={index}>
        <a href={d.pic}>
            <img src={d.pic} alt={d.text}/>
        </a>
        <figcaption>{d.text}</figcaption>
    </figure>)}
</div>)