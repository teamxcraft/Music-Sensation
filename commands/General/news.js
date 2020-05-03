const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	const embed = new RichEmbed()
	.setColor('RANDOM')
	.setAuthor('Music Sensation News', client.user.displayAvatarURL)
	.setDescription('News:\n```Hello, because of some memory leaks, we updated the player a little bit. Now you have to join the voice channel for the bot to appear! Sorry for inconvenience```')
	.setFooter(client.footer);
	msg.channel.send(embed);
}

exports.info = {
	name: 'news',
	aliases: ['n'],
	description: 'Lookup the current news from music sensation.',
	usage: 'news',
	category: 'General'
}