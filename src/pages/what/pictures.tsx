import React from 'react';
import './pictures.scss';
import SimpleRoom from '../../assets/screenshots/simple-room.jpg';
import StartRoom from '../../assets/screenshots/start-room.jpg';
import {Image} from "../../components/image";

const data = [{
    pic: StartRoom,
    text: 'The Lobby, where the game begins... (you are by default assigned an arbitrary name)'
}, {
    pic: SimpleRoom,
    text: 'The Hallway, a room with a puzzling puzzle to solve. You have scanned some instructions into your P.I.N.X...'
}]

export const Pictures = () => (<div className='pictures'>
    <header>
        <h3>Explanatory pictures:</h3>
    </header>
    {data.map((d, index) => <Image key={index} image={d.pic} caption={d.text}/>)}
</div>)