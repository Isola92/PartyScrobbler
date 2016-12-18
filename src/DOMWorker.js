/**
 * Takes in data and modifies the DOM accordingly.
 */
export const viewTrackData = (artist, track, imgurl) => {
    let artistname = document.getElementById('artist');
    let trackname = document.getElementById('track');

    artistname.innerHTML = artist + " - ";
    trackname.innerHTML = track;

    updateBackground(imgurl);
};


const updateBackground = (imgurl) => {
    let image = document.getElementById('image');
    image.src = imgurl;
};

const getTextFieldInfo = () => {
    document.getElementById('')
};


export const viewParty = (users) => {
    let party = document.getElementById('party')

    while (party.firstChild) {
        party.removeChild(party.firstChild);
    }

    users.forEach( (user) => {
        let listitem = document.createElement('LI');
        listitem.innerHTML = user;
        party.appendChild(listitem);
    })
}