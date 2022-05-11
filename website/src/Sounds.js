let playing_connected = false;
export const PlayConnectSound = () => {
    if (playing_connected) {
        return;
    }
    
    playing_connected = true;
    const audio = new Audio('connect.mp3');
    audio.volume = 0.4;
    audio.play();
    
    setTimeout(() => {
        audio.remove();
        playing_connected = false;
    }, 500);
}

let playing_disconnected = false;
export const PlayDisconnectSound = () => {
    if (playing_disconnected) {
        return;
    }
    
    playing_disconnected = true;
    const audio = new Audio('disconnect.mp3');
    audio.volume = 0.4;
    audio.play();
    
    setTimeout(() => {
        audio.remove();
        playing_disconnected = false;
    }, 1000);
}