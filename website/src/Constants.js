export const LOCALSTORE_MIC_PREF_NAME = 'SelectedMicrophone';
export const LOCALSTORE_VOICE_CODE_NAME = 'VoiceCode';
export const LOCALSTORE_VOLUME_NAME = 'VoiceVolume';

export const CONNECTION_STATE = {
    NOT_CONNECTED: 1,
    CONNECTING: 2,
    CONNECTED: 3,
};

export const CONNECTION_STATE_DATA = {
    [CONNECTION_STATE.NOT_CONNECTED]: { text: 'Not connected', color: 'red' },
    [CONNECTION_STATE.CONNECTING]: { text: 'Connecting...', color: 'yellow' },
    [CONNECTION_STATE.CONNECTED]: {
        text: 'Connected',
        color: 'rgba(0, 255, 0, 0.75)',
    },
};

// Player volume goes down over this distance
export const MAX_PLAYER_DISTANCE = 60;