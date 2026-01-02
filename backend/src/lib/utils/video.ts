import * as MP4Box from "mp4box";

export function getMp4Duration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

        const mp4boxFile = MP4Box.createFile();
        mp4boxFile.onError = (e) => {
            return reject(e);
        };

        mp4boxFile.onReady = (info) => {
            const seconds = info.duration / info.timescale;
            resolve(Math.floor(seconds));
        };

        const ab = arrayBuffer as any;
        ab.fileStart = 0;

        mp4boxFile.appendBuffer(ab);
        mp4boxFile.flush();
    });
}

