const PEER_PORT = 8880;
const EXPRESS_PORT = process.env.NODE_ENV == 'production' ? 8080 : 3001;
const JCMP_PORT = 4002;

import dgram from 'dgram';
const sock = dgram.createSocket('udp4');

sock.on('listening', function () {
    console.log('Voice UDP server listening...');
});

sock.on('error', function (err) {
    console.log('UDP Server error:\n' + err.stack);
    console.log('UDP Server closing...');
    sock.close();
    console.log('UDP Restarting server...');
    setTimeout(() => {
        sock.bind(JCMP_PORT, 'localhost');
    }, 2000);
});

sock.bind(JCMP_PORT, 'localhost');

sock.on('message', async function (msg, rinfo) {
    const data = msg.toString();

    const decoded_data = JSON.parse(data);
    const data_obj = decoded_data[0];

    if (data_obj.evt == 'players_update') {
        jcmp.playersUpdate(data_obj.data);
    }
});

import { PeerServer } from 'peer';
const peerServer = PeerServer({
    port: PEER_PORT,
    path: '/voice',
    // allow_discovery: true, // Do not allow discovery because we will send all ids
});
console.log(`Peer server listening on port ${PEER_PORT}...`);

peerServer.on('error', (error) => {
    console.log(`Error:`);
    console.log(error);
});

peerServer.on('connection', (client) => {
    console.log('connection ' + client.getId());
});

peerServer.on('disconnect', (client) => {
    console.log('disconnect ' + client.getId());

    const player = jcmp.getPlayerByPeerId(client.getId());
    if (typeof player != 'undefined') {
        jcmp.removePlayerByPeerId(player.peer_id);
    }
});

// https://github.com/peers/peerjs-server

// use api requests from client to get latest player data
// https://stackoverflow.com/questions/71823930/can-i-send-some-metadata-while-answering-a-call-using-peerjs

// import rateLimit from "express-rate-limit";
import express from 'express';
import cors from 'cors';
import path from 'path';
import jcmp from './jcmp_users.mjs';
import { UserConnect } from './voice_codes.mjs';

// const apiLimiter = rateLimit({
//     windowMs: 10 * 60, // 1 minute
//     max: 300
// });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

const server = app.listen(EXPRESS_PORT, () =>
    console.log(`Express server listening on port ${EXPRESS_PORT}!`)
);

app.post('/connect', UserConnect);

app.post('/players', (req, res, next) => {
    const peer_id = req.body.peer_id;
    if (!peer_id) {
        res.status(200).end();
        return;
    }

    const player = jcmp.getPlayerByPeerId(peer_id);
    if (!player) {
        res.status(200).end();
        return;
    }

    res.status(200)
        .send({ players: jcmp.getSyncData(player) })
        .end();
});

app.get('*', (req, res) => {
    const __dirname = path.resolve(path.dirname(''));
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
