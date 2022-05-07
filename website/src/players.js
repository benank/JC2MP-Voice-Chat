import Voice from './Voice';
import { connectionState } from './stores';
import { CONNECTION_STATE } from './Constants';

export let players = {};

export const startPlayerUpdateLoop = async () => {
    setInterval(() => {
        fetch('/players', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                peer_id: Voice.peer_id,
            }),
        })
            .then(async (response) => {
                response = await response.json();
                if (response.players) {
                    players = response.players;
                    Voice.playersUpdated(players);

                    if (Object.keys(response.players).length >= 1) {
                        connectionState.set(CONNECTION_STATE.CONNECTED);
                    }
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, 1000);
};
