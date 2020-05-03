exports.run = async (client, msg, args) => {
	if(!client.owners.includes(msg.author.id)) return;
	try{
		let evaled = eval(args.join(' '));
		if(typeof evaled !== 'string') evaled = require('util').inspect(evaled, { depth: 0 });
		return msg.channel.send(evaled, { code: 'js' });
	}catch(e){
		return msg.channel.send(`${e}`, { code: 'ini' });
	}
}

exports.info = {
	name: 'eval',
	aliases: ['ev'],
	description: 'Evaluate some arbitary javascript.',
	usage: 'eval <code>',
	category: null
}