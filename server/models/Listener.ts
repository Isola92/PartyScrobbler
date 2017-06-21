export class Listener
{
    public socketID: number;
    public name: string;
    
    constructor(name: string, socketID: number)
    {
        this.socketID = socketID;
        this.name = name;
    }
}