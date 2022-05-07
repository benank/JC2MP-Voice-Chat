import { voiceStore } from './stores';
import { RequestMicAccess } from './utils';

class Voice {
    constructor() {
        this.peer = new Peer(null, {
            host: '/',
            port: 9000,
            path: '/voice',
            debug: 1,
            config: {
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                            'stun:stun2.l.google.com:19302',
                            'stun:stun3.l.google.com:19302',
                        ],
                    },
                ],
            },
        });
        this.peer_id = null;
        this.is_connected = false;
        console.log('Me: ' + this.peer);
        this.call_audio = {};

        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            this.peer_id = id;
            this.is_connected = true;
            this.updateStore();
            this.answer();

            // Lists all peer ids (including self)
            // this.peer.listAllPeers((peerIds) => {
            //     console.log(peerIds);
            // });
        });

        this.peer.on('disconnected', () => {
            this.is_connected = false;
            this.updateStore();
            // use peer.reconnect to reconnect to the server
        });

        this.peer.on('close', () => {
            this.is_connected = false;
            this.updateStore();
        });

        this.positions = {};
        this.microphone_stream = null;
    }

    playersUpdated(players) {
        console.log(players);
        Object.values(players).forEach((player) => {
            if (!this.call_audio[player.id]) {
                this.call(player.id);
            }
        });
    }

    updateStore() {
        voiceStore.set({
            connected: this.is_connected,
            peer_id: this.peer_id,
            steam_id: this.steam_id,
            call_streams: this.call_audio,
        });
    }

    createNewAudioFromCallStream(peerId, remoteStream) {
        const audio = new Audio();
        audio.volume = 0.5;
        audio.autoplay = true;
        audio.srcObject = remoteStream;
        this.call_audio[peerId] = audio;
        this.updateStore();
    }

    call(peerId) {
        if (this.call_audio[peerId] || peerId == this.peer_id) {
            return;
        }

        console.log('calling ' + peerId);
        var call = this.peer.call(peerId, this.microphone_stream);
        call.on('stream', (remoteStream) => {
            console.log('call: got remote stream from ' + peerId);
            console.log(remoteStream);
            this.createNewAudioFromCallStream(peerId, remoteStream);
            // Show stream in some video/canvas element.
        });
        // Add to list of callers, etc
    }

    answer() {
        this.peer.on('call', (call) => {
            // Call is of type MediaConnection
            const peerId = call.peer;
            call.answer(this.microphone_stream); // Answer the call with an A/V stream.
            call.on(
                'stream',
                (remoteStream) => {
                    console.log('answer: got remote stream from ' + peerId);
                    console.log(remoteStream);
                    this.createNewAudioFromCallStream(peerId, remoteStream);
                    // Show stream in some video/canvas element.
                },
                (err) => {
                    console.log('Failed to get local stream', err);
                }
            );
        });
    }

    is_ready_to_call() {
        return this.microphone_stream != null;
    }

    set_audio_stream(stream) {
        this.microphone_stream = stream;
    }

    async audio_device_changed(device) {
        if (device) {
            const stream = await RequestMicAccess(device.deviceId);
            this.set_audio_stream(stream);
            console.log(`Using device ${device.label}`);
            console.log(stream);
        }
        // Reconnect to all peers with new audio stream if already connected
    }
}

const v = new Voice();
export default v;
