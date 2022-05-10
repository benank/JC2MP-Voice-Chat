import { writable } from "svelte/store";
import { CONNECTION_STATE } from "./Constants";

export const selectedAudioDevice = writable();
export const connectedToServer = writable(false);
export const connectionState = writable(CONNECTION_STATE.NOT_CONNECTED)
export const voiceStore = writable({});
export const voiceVolume = writable(1);