const { RichEmbed, Util } = require('discord.js');

exports.run = async (client, msg, args) => {
// console.log(client.queues)
// 	return;
	const embed = new RichEmbed()
	.setColor('RED')
	.setAuthor('Now playing..', 'https://images-ext-1.discordapp.net/external/YwuJ9J-4k1AUUv7bj8OMqVQNz1XrJncu4j8q-o7Cw5M/http/icons.iconarchive.com/icons/dakirby309/simply-styled/256/YouTube-icon.png')
	.setDescription(`[${Util.escapeMarkdown(client.radio.nowplay.title)}](${client.radio.nowplay.url})`)
	.addField('Queue', client.queues.slice(0).splice(0, 5).map((x, i) => `${i+1}. [${Util.escapeMarkdown(x.title)}](${x.url})`).join('\n') + '\n\nFor more queue [click here](https://musicsensation.xyz/queues/)')
	.setFooter(`${client.songList.length || 0} songs are registered • ${client.footer}`);
	return msg.channel.send(embed);
}

exports.info = {
	name: 'queue',
	aliases: ['q'],
	description: 'Lookup 5 songs for future playing.',
	usage: 'queue',
	category: 'Music'
}