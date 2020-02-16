import React from 'react';
import './pictures.scss';
import SimpleRoom from '../../assets/screenshots/simple-room.jpg';
import StartRoom from '../../assets/screenshots/start-room.jpg';
import {Image} from "../../components/image";

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
    {data.map((d, index) => <Image image={d.pic} caption={d.text}/>)}
</div>)