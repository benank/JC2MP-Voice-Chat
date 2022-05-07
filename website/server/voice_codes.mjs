import db from './db.mjs';
import jcmp from './jcmp_users.mjs';

export const UserConnect = async (req, res, next) => {
    const voice_code = req.body.voice_code;
    const peer_id = req.body.peer_id;
    if (!voice_code || !peer_id) {
        res.status(200).send({ success: false }).end();
        return;
    }

    const steamID = await db.getSteamIdFromVoiceCode(voice_code);

    if (typeof steamID == 'undefined') {
        res.status(200).send({ success: false }).end();
        return;
    }

    console.log(`UserConnect ${voice_code} ${peer_id} ${steamID}`);

    // Update peer_id on player
    const player = jcmp.players[steamID];
    if (typeof player == 'undefined') {
        res.status(200).send({ success: false }).end();
        return;
    }

    player.peer_id = peer_id;
    res.status(200).send({ success: true }).end();
};
