const { telegram } = require('../index');
const net = require('net');


let ToVarInt = (value) => {
    let bytes = [];

    do {
        let temp = (value & 0b01111111);
        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value >>>= 7;
        if (value != 0) {
            temp |= 0b10000000;
        }
        bytes.push(temp);
    } while (value != 0);

    return Buffer.from(bytes);
}

exports.minecraft = {
    help: 'Kertoo kuinka monta pelaajaa serverillä on',
    usage: '/minecraft',
    aliases: [ 'mc' ],
    func: (args, update) => {
        let host = process.env.MC_ADDR;
        let port = Number(process.env.MC_PORT);

        let client = net.connect({ host, port }, () => {
            let bufPacketId = ToVarInt(0);
            let bufVersion = ToVarInt(-1);
            let bufAddressLen = ToVarInt(host.length);
            let bufAddress = Buffer.from(host);
            let bufPort = Buffer.from([ port >> 8, port ]);
            let bufMode = ToVarInt(1);

            let bufLength = ToVarInt(
                bufPacketId.length +
                bufVersion.length +
                bufAddressLen.length +
                bufAddress.length +
                bufPort.length +
                bufMode.length
            );

            let buf = Buffer.concat([ bufLength, bufPacketId, bufVersion, bufAddressLen, bufAddress, bufPort, bufMode ]);
            
            client.write(buf);
            client.write(Buffer.concat([ ToVarInt(1), ToVarInt(0) ]));
        });

        client.on('data', (data) => {
            data = data.toString();
            while (data[0] !== '{') {
                data = data.substr(1);
            }

            data = JSON.parse(data);

            let text = `<b>${data.description.text}</b> (${data.players.online}/${data.players.max})`;

            for (let p in data.players.sample) {
                text += `\n    ${data.players.sample[p].name}`
            }

            telegram.SendMessage(update.chat, text, { disable_notification: true, parse_mode: 'HTML' });
            
            client.end();
        });
    }
}
