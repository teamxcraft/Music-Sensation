const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	let mess = args.join(' ');
	if(!mess) return msg.channel.send(`:x: | Please insert the message e.g \`${msg.prefix}bug <msg>\``);
	const embed = new RichEmbed()
	.setColor(`#ff4444`)
	.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
	.setDescription(mess)
	.setFooter(msg.guild.name)
	.setTimestamp();
	client.channels.get(`526707455179096076`).send(':eyes: | Please take a look there\'s a new bug!', {embed});
	msg.channel.send(`:white_check_mark: | Thank you ${msg.author}! Your bug report has been sent to our developer.`)
}

exports.info = {
	name: 'bug',
	aliases: [],
	description: 'Report any bug to our developer',
	usage: 'bug <msg>',
	category: 'General'
}