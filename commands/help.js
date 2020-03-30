const { telegram } = require('../index');

exports.help = {
    help: 'Listaa kaikki komennot',
    usage: '/help [command]',
    func: (args, update) => {
        const commands = require('./index');
        let msg = '';

        if (args.length > 0) {
            if (commands[args[0]]) {
                msg = `${commands[args[0]].help}\nKäyttö: ${commands[args[0]].usage}`;
            } 
            else {
                msg = `Komentoa ${args[0]} ei löydy\nKirjoita /help saadaksesi listan komennoista`;
            }
        }
        else {
            for (let cmd in commands) {
                msg += `/${cmd} - ${commands[cmd].help}\n`;
            }
        }

        telegram.SendMessage(update.chat, msg);
    }
}

exports.usage = {
    help: 'Kertoo miten komentoa käytetään',
    usage: '/usage <command>',
    func: (args, update) => {
        const commands = require('./index');
        let msg;

        if (args.length === 0) {
            msg = `Käyttö: /usage <command>`;
        }
        else {
            console.log(commands);
            msg = `Käyttö: ${commands[args[0]].usage}`;
        }

        telegram.SendMessage(update.chat, msg);
    }
}