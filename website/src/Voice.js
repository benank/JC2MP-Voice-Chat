import { MAX_PLAYER_DISTANCE } from './Constants';
import { voiceStore, voiceVolume } from './stores';
import { distance, RequestMicAccess } from './utils';
import { disconnectedHandler } from './handlers';
import { get } from 'svelte/store';

class Voice {
    constructor() {
        this.connectToPeerService();
        this.peer_id = null;
        this.is_connected = false;
        this.call_audio = {};
        this.calls = {};
        this.microphone_stream = null;
    }

    connectToPeerService() {
        this.peer = new Peer(null, {
            host: '/',
            port: 2083,
            path: '/voice',
            debug: 1,
        });

        this.peer.on('open', (id) => {
            this.peer_id = id;
            this.is_connected = true;
            this.updateStore();
            this.answer();
        });

        this.peer.on('disconnected', () => {
            disconnectedHandler();
            this.updateStore();
            // use peer.reconnect to reconnect to the server
        });

        this.peer.on('close', () => {
            disconnectedHandler();
            this.updateStore();
        });
    }

    disconnectFromPeerService() {
        if (!this.is_connected) {
            return;
        }

        this.is_connected = false;
        this.peer.destroy();
        setTimeout(() => {
            this.connectToPeerService();
        }, 500);
    }

    playersUpdated(players) {
        const my_player_data = players[this.peer_id];
        this.audio_volume_modifier = get(voiceVolume);

        // Remove players that are not included in the latest data
        Object.entries(this.call_audio).forEach(([peerId, audio]) => {
            if (typeof players[peerId] == 'undefined') {
                this.removePeer(peerId);
            }
        });

        Object.values(players).forEach((player) => {
            if (!this.call_audio[player.id]) {
                this.call(player.id);
            } else {
                this.call_audio[player.id].volume = this.getAudioVolume(
                    player,
                    my_player_data
                );
                this.call_audio[player.id].muted = player.muted == true;
            }
        });

        this.updateStore();
    }

    getAudioVolume(playerData, myPlayerData) {
        if (
            typeof playerData == 'undefined' ||
            typeof myPlayerData == 'undefined'
        ) {
            return 0;
        }

        // Both players are in the same vehicle
        if (
            typeof playerData.v_id != 'undefined' &&
            typeof myPlayerData.v_id != 'undefined' &&
            playerData.v_id === myPlayerData.v_id
        ) {
            return 1 * this.audio_volume_modifier;
        }

        const dist = distance(playerData.position, myPlayerData.position);
        return (
            Math.max(0, 1 - dist / MAX_PLAYER_DISTANCE) *
            this.audio_volume_modifier
        );
    }

    updateStore() {
        voiceStore.set({
            connected: this.is_connected,
            peer_id: this.peer_id,
            steam_id: this.steam_id,
        });
    }

    createNewAudioFromCallStream(peerId, remoteStream) {
        const audio = new Audio();
        audio.volume = 0;
        audio.autoplay = true;
        audio.srcObject = remoteStream;
        this.call_audio[peerId] = audio;
    }

    disconnectAll() {
        Object.keys(this.calls).forEach((peerId) => {
            this.removePeer(peerId);
        });
    }

    removePeer(peerId) {
        if (this.call_audio[peerId]) {
            this.call_audio[peerId].muted = true;
            this.call_audio[peerId].srcObject = null;
            this.call_audio[peerId].remove();
            delete this.call_audio[peerId];
        }

        if (this.calls[peerId]) {
            this.calls[peerId].close();
            delete this.call_audio[peerId];
        }
    }

    call(peerId) {
        if (
            this.call_audio[peerId] ||
            peerId == this.peer_id ||
            this.calls[peerId]
        ) {
            return;
        }

        var call = this.peer.call(peerId, this.microphone_stream);
        call.on('stream', (remoteStream) => {
            this.createNewAudioFromCallStream(peerId, remoteStream);
            // Show stream in some video/canvas element.
        });
        call.on('close', () => {
            this.removePeer(peerId);
        });
        call.on('error', () => {
            this.removePeer(peerId);
        });

        this.calls[peerId] = call;
    }

    answer() {
        this.peer.on('call', (call) => {
            // Call is of type MediaConnection
            const peerId = call.peer;
            this.calls[peerId] = call;
            call.answer(this.microphone_stream); // Answer the call with an A/V stream.
            call.on(
                'stream',
                (remoteStream) => {
                    this.createNewAudioFromCallStream(peerId, remoteStream);
                },
                (err) => {
                    console.log('Failed to get local stream', err);
                    this.removePeer(peerId);
                }
            );
            call.on('close', () => {
                this.removePeer(peerId);
            });
            call.on('close', () => {
                this.removePeer(peerId);
            });
        });
    }

    is_ready_to_call() {
        return this.microphone_stream != null;
    }

    set_audio_stream(stream) {
        this.microphone_stream = stream;
    }

    stop_mic_stream() {
        if (this.microphone_stream != null) {
            this.microphone_stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    }

    async audio_device_changed(device) {
        if (device) {
            this.stop_mic_stream();
            const stream = await RequestMicAccess(device);
            this.set_audio_stream(stream);
            disconnectedHandler();
        }
    }
}

const v = new Voice();
export default v;
