const mongoUtil = require('../mongoUtil');
const { telegram } = require('../index');
const helpCommands = require('./help');

let collection = undefined;
let GetCollection = () => {
    if (!collection) {
        collection = mongoUtil.getDb().collection('quotes');
    }
    
    return collection;
}

exports.quote = {
    help: 'Lähettää satunnaisen quoten',
    usage: '/quote [name]',
    aliases: [ 'q' ],
    func: (args, update) => {
        let query = {};
        if (args.length > 0) {
            query.name = args[0];
        }

        GetCollection().find(query).toArray((err, docs) => {
            if (docs.length > 0) {
                let selectedQuote = docs[Math.floor(Math.random() * docs.length)];
                telegram.SendMessage(update.chat, `"${selectedQuote.quote}" - ${selectedQuote.name}`, { disable_notification: true });
            } 
            else {
                telegram.SendMessage(update.chat, 'Tuolta henkilöltä ei löydy quoteja :(', { disable_notification: true });
            }
        });
    }
}

exports.addq = {
    help: 'Lisää uuden quoten käyttäjälle',
    usage: '/addq <name> <quote>',
    aliases: [ 'aq' ],
    func: (args, update) => {
        if (args.length < 2) {
            helpCommands.usage.func([ "addq" ], update);
            return;
        }

        let name = args.shift();
        let quote = args.join(' ');

        GetCollection().insertOne({ name, quote });
        telegram.SendMessage(update.chat, `Quote lisätty`, { disable_notification: true });
    }
}
