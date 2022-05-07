import DB from './db.mjs';
import { arePlayersCloseEnough } from './utils.mjs';

class Player {
    constructor(args) {
        this.steamID = args.steamID;
        this.position = args.pos;
        this.peer_id = null;
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
                this.removePlayer(steamID);
            }
        });

        // Add new players and update existing
        Object.entries(players).forEach(([steamID, player_data]) => {
            if (typeof this.players[steamID] == 'undefined') {
                player_data.steamID = steamID;
                this.addPlayer(player_data);
            }

            const player = this.players[steamID];
            player.position = player_data.pos;
        });
    }

    addPlayer(player_data) {
        const player = new Player(player_data);
        this.players[player.steamID] = player;
    }

    removePlayer(steamID) {
        if (this.players[steamID]) {
            delete this.players[steamID];
        }
    }
}

const jcmp = new JCMP();
export default jcmp;
