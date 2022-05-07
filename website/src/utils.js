export const HasMicAccess = async () => {
    return new Promise(async (resolve, reject) => {
        const devices = await GetAllAudioDevices();
        resolve(
            devices.filter((e) => e.label && e.label.length > 0).length > 0
        );
    });
};

export const RequestMicAccess = async (device) => {
    const audio_config = device
        ? { deviceId: { exact: device.deviceId } }
        : true;
    return new Promise(async (resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia({
                audio: audio_config,
                video: false,
            })
            .then(function (stream) {
                resolve(stream);
            })
            .catch(function (error) {
                console.log(`Failed to get mic: ${error}`);
                reject();
            });
    });
};

export const GetAllAudioDevices = async () => {
    return new Promise(async (resolve, reject) => {
        // TIP: once access has been allowed to audio devices, all labels are shown
        navigator.mediaDevices
            .enumerateDevices()
            .then(function (devices) {
                resolve(devices.filter((e) => e.kind == 'audioinput'));
            })
            .catch(function (err) {
                console.log(err.name + ': ' + err.message);
            });
    });
};

export const distance = (a, b) => {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
    );
};
