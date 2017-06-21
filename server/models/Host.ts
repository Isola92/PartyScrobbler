import {Track} from "./Track";
import {Listener} from "./Listener";

export class Host
{
    public socketID: number;
    public name: string;
    public tracks: Track[];
    public listeners: Listener[];

    constructor(name: string, socketID: number)
    {
        this.socketID = socketID;
        this.name = name;
        this.listeners = [];
        this.tracks = [];
    }
}