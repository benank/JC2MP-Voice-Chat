export const HasMicAccess = async () => {
    return new Promise(async (resolve, reject) => {
        const devices = await GetAllAudioDevices();
        resolve(
            devices.filter((e) => e.label && e.label.length > 0).length > 0
        );
    });
};

export const RequestMicAccess = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia({
                audio: {
                    exact: deviceId
                },
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
