import Voice from './Voice';
import { connectionState } from './stores';
import { CONNECTION_STATE } from './Constants';

// Called when the player is disconnected from the server for any reason
export const disconnectedHandler = () => {
    Voice.disconnectAll();
    Voice.disconnectFromPeerService();
    connectionState.set(CONNECTION_STATE.NOT_CONNECTED);
}