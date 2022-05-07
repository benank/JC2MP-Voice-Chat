<script>
    import { onMount } from 'svelte';
    import Voice from './Voice';
    import {
        HasMicAccess,
        RequestMicAccess,
        GetAllAudioDevices,
    } from './utils';
    import { selectedAudioDevice, connectionState, voiceStore } from './stores';
    import {
        LOCALSTORE_MIC_PREF_NAME,
        LOCALSTORE_VOICE_CODE_NAME,
        CONNECTION_STATE_DATA,
        CONNECTION_STATE,
    } from './Constants';
    import { startPlayerUpdateLoop } from './players';

    let has_mic_access = false;
    let voice_code_input = '';
    let mounted = false;

    // Read ID from localstorage

    onMount(async () => {
        has_mic_access = await HasMicAccess();

        const stored_voice_code = localStorage.getItem(
            LOCALSTORE_VOICE_CODE_NAME
        );
        if (stored_voice_code) {
            voice_code_input = stored_voice_code;
        }

        mounted = true;
    });

    let audioDevices = [];
    const RefreshAudioDevices = async () => {
        audioDevices = await GetAllAudioDevices();

        if (audioDevices.length > 0 && !$selectedAudioDevice) {
            const localStoreCamId = localStorage.getItem(
                LOCALSTORE_MIC_PREF_NAME
            );
            const selectedMic = audioDevices.find(
                (e) => e.deviceId == localStoreCamId
            );
            $selectedAudioDevice = selectedMic ? selectedMic : audioDevices[0];
        }
    };

    const clickAudioDevice = async (device) => {
        const selectedMic = audioDevices.find(
            (e) => e.deviceId == device.deviceId
        );
        if (selectedMic) {
            $selectedAudioDevice = selectedMic;
        }
    };

    const requestMicAcess = async () => {
        await RequestMicAccess();
        has_mic_access = await HasMicAccess();
    };

    $: {
        has_mic_access, RefreshAudioDevices();
    }

    $: Voice.audio_device_changed($selectedAudioDevice);
    $: {
        if ($selectedAudioDevice != null) {
            localStorage.setItem(
                LOCALSTORE_MIC_PREF_NAME,
                $selectedAudioDevice.deviceId
            );
        }
    }

    $: {
        if (mounted) {
            localStorage.setItem(LOCALSTORE_VOICE_CODE_NAME, voice_code_input);
        }
    }
    
    const clickConnectOrDisconnect = () => {
        if ($connectionState == CONNECTION_STATE.CONNECTED) {
            clickDisconnectFromVoice();
        } else if ($connectionState == CONNECTION_STATE.NOT_CONNECTED) {
            clickConnectToVoice();
        }
    }
    
    const clickDisconnectFromVoice = () => {
        // TODO: disconnect
    }

    const clickConnectToVoice = async () => {
        if (!has_mic_access) {
            console.error('Cannot connect; no microphone access');
            return;
        }

        if (voice_code_input.length < 1) {
            console.error('Cannot connect; no voice code entered');
            return;
        }

        if (!Voice.is_connected) {
            console.error('Cannot connect; not connected to voice server');
            return;
        }

        fetch('/connect', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                voice_code: voice_code_input,
                peer_id: Voice.peer_id,
            }),
        })
            .then(async (response) => {
                response = await response.json();

                if (response.success) {
                    $connectionState = CONNECTION_STATE.CONNECTING;
                    // WE'RE IN, NOW CONNECT TO ALL PEERS
                    startPlayerUpdateLoop();
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    // https://github.com/peers/peerjs
</script>

<main>
    <h1>Panau Survival</h1>
    <h2>Voice Chat</h2>
    <p>
        Proximity voice chat for Panau Survival on Just Cause 2 Multiplayer.<br
        />
        Join our discord at
        <a href="https://discord.gg/DWGfX3b" target="_blank"
            >https://discord.gg/DWGfX3b</a
        >
    </p>
    <p class="left">
        Instructions:<br /> <br />
        1. Connect to Panau Survival on Just Cause 2 Multiplayer.<br />
        2. Type <code>/voice</code> in chat. This will bring up the Voice Chat
        Menu.<br />
        3. Copy your Voice Code from the box.
        <b>DO NOT SHARE THIS WITH ANYONE.</b><br />
        4. Paste your Voice Code below.<br />
        5. Click Connect.<br />
        6. Once you are connected, you will need to allow access to your microphone.<br
        />
        7. Now you will be able to talk with nearby players.<br />
    </p>
    <div class="two-col">
        <div class="mic-container">
            {#if !has_mic_access}
                <div
                    class="allow-mic-button"
                    on:click={() => requestMicAcess()}
                >
                    Allow Mic Access
                </div>
            {:else}
                <div class="devices-label">Audio Devices</div>
                {#each audioDevices as device}
                    <div
                        class="audio-device"
                        class:selected={device.deviceId ==
                            $selectedAudioDevice.deviceId}
                        on:click={() => clickAudioDevice(device)}
                    >
                        {device.label}
                    </div>
                {/each}
            {/if}
        </div>
        <div class="connection-container">
            <div
                class="connection-text"
                style={`color: ${CONNECTION_STATE_DATA[$connectionState].color};`}
            >
                {CONNECTION_STATE_DATA[$connectionState].text}
            </div>
            <div class="code">
                Voice Code (from JC2MP):
                <input class="code" bind:value={voice_code_input} type="text" />
            </div>
            <div
                class="connect-button"
                class:connected={$connectionState == CONNECTION_STATE.CONNECTED}
                on:click={() => clickConnectOrDisconnect()}
            >
                {#if $connectionState == CONNECTION_STATE.CONNECTED}
                    Disconnect
                {:else}
                    Connect
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        height: 100%;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
        font-weight: bold;
    }

    h2 {
        color: #d74c1d;
        font-size: 3em;
        font-weight: 100;
        margin: 10px;
    }

    p {
        margin-top: 40px;
    }

    p.left {
        margin-top: 20px;
        text-align: left;
    }

    div.connect-button {
        padding: 10px;
        min-width: 200px;
        background-color: whitesmoke;
        color: rgb(30, 27, 26);
        border-radius: 20px;
        font-weight: bold;
        font-size: 1.5em;
        margin: 20px;
        user-select: none;
        cursor: pointer;
    }

    div.connect-button.connected {
        color: whitesmoke;
        background-color: #d74c1d;
    }

    div.allow-mic-button {
        padding: 10px;
        min-width: 200px;
        background-color: whitesmoke;
        color: rgb(30, 27, 26);
        border-radius: 20px;
        font-weight: bold;
        font-size: 1.25em;
        user-select: none;
        cursor: pointer;
        text-align: center;
    }

    div.connection-text {
        font-weight: bold;
        color: red;
    }

    div.connection-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
        width: 300px;
        height: 300px;
        /* background-color: rgb(255, 255, 255, 0.1); */
        border-radius: 500px;
    }

    div.two-col {
        display: flex;
        flex-direction: row;
        margin-top: 20px;
        border-top: 2px solid orange;
        padding: 20px;
    }

    div.mic-container {
        text-align: left;
    }

    div.devices-label {
        font-weight: bold;
        font-size: 1.25em;
        margin-bottom: 10px;
    }

    div.mic-container div.audio-device {
        padding: 6px;
        background-color: rgba(255, 255, 255, 0.1);
        margin-bottom: 2px;
        cursor: pointer;
    }

    div.mic-container div.audio-device.selected {
        background-color: rgba(0, 255, 0, 0.5);
        font-weight: bold;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
