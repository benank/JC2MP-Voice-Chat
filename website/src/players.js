import Voice from './Voice';
import { connectionState } from './stores';
import { CONNECTION_STATE } from './Constants';
import { get } from "svelte/store";
import { disconnectedHandler } from './handlers';

export let allNearbyPlayers = {};

export const startPlayerUpdateLoop = async () => {
    let interval;
    interval = setInterval(() => {
        if (get(connectionState) != CONNECTION_STATE.CONNECTED) {
            clearInterval(interval);
            return;
        }
        
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
                    allNearbyPlayers = response.players;
                    Voice.playersUpdated(allNearbyPlayers);
                }
            })
            .catch((err) => {
                allNearbyPlayers = {};
                Voice.playersUpdated(allNearbyPlayers);
                disconnectedHandler();
            });
    }, 500);
};
