import { MAX_2D_STREAM_DISTANCE } from './constants.mjs';

/**
 * Helper function to determine if two players are close enough to be able to send data and talk.
 * Not precise or accurate; has much larger range that the actual check (clientside) and is only 2D.
 * Main use is limiting what data is sent to each client so not everyone gets player data from
 * across the map.
 *
 * @param {*} a Player1
 * @param {*} b Player2
 */
export const arePlayersCloseEnough = (a, b) => {
    const x_distance = Math.abs(a.position.x - b.position.x);
    const y_distance = Math.abs(a.position.y - b.position.y);
    const z_distance = Math.abs(a.position.z - b.position.z);
    return (
        x_distance < MAX_2D_STREAM_DISTANCE &&
        y_distance < MAX_2D_STREAM_DISTANCE &&
        z_distance < MAX_2D_STREAM_DISTANCE
    );
};
