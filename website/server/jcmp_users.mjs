import DB from './db.mjs';
import { arePlayersCloseEnough } from './utils.mjs';

class Player {
    constructor(args) {
        this.steamID = args.steamID;
        this.position = args.pos;
        this.vehicle_id = args.v_id;
        this.peer_id = null;
    }

    update(player_data) {
        this.position = player_data.pos;
        this.vehicle_id = player_data.v_id;
    }

    /**
     * Returns true if player is connected on the JC2MP server and the voice server
     */
    isFullyConnected() {
        return this.peer_id != null && this.position != null;
    }

    getSyncData(player) {
        return {
            id: this.peer_id,
            position: this.position,
            me: player.steamID == this.steamID,
            v_id: this.vehicle_id,
        };
    }
}

class JCMP {
    constructor() {
        this.players = {};
    }

    getPlayerByPeerId(peer_id) {
        return Object.values(this.players).find(
            (player) => player.peer_id == peer_id
        );
    }

    getSyncData(player) {
        const data = {};

        Object.entries(this.players).forEach(([steamID, other_player]) => {
            if (
                other_player.isFullyConnected() &&
                arePlayersCloseEnough(player, other_player)
            ) {
                data[other_player.peer_id] = other_player.getSyncData(player);
            }
        });

        return data;
    }

    playersUpdate(players) {
        // Remove players that are not included in the latest data
        Object.entries(this.players).forEach(([steamID, player]) => {
            if (typeof players[steamID] == 'undefined') {
                this.removePlayerBySteamID(steamID);
            }
        });

        // Add new players and update existing
        Object.entries(players).forEach(([steamID, player_data]) => {
            if (typeof this.players[steamID] == 'undefined') {
                player_data.steamID = steamID;
                this.addPlayer(player_data);
            }

            const player = this.players[steamID];
            player.update(player_data);
        });
    }

    addPlayer(player_data) {
        const player = new Player(player_data);
        this.players[player.steamID] = player;
    }

    removePlayerBySteamID(steamID) {
        if (this.players[steamID]) {
            delete this.players[steamID];
        }
    }

    removePlayerByPeerId(peerId) {
        Object.entries(this.players).forEach(([steamID, player]) => {
            if (player.peer_id == peerId && peerId != null) {
                delete this.players[steamID];
                return;
            }
        });
    }
}

const jcmp = new JCMP();
export default jcmp;
