
export class Track
{
    public artist: string;
    public name: string;
    public album: string;
    public image: string;
    
    constructor(artist: string, name: string, album: string, image: string)
    {
        this.artist = artist;
        this.name = name;
        this.album = album;
        this.image = image;
    }
}