const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	let mess = args.join(' ');
	if(!mess) return msg.channel.send(`:x: | Please insert the message e.g \`${msg.prefix}suggestion <msg>\``);
	const embed = new RichEmbed()
	.setColor(`#dfff44`)
	.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
	.setDescription(mess)
	.setFooter(msg.guild.name)
	.setTimestamp();
	client.channels.get(`526706611625132043`).send(embed);
	msg.channel.send(`:white_check_mark: | Thank you ${msg.author}! Your suggestion has been sent to our developer.`)
}

exports.info = {
	name: 'suggestion',
	aliases: ['sug', 'suggest'],
	description: 'suggest to our developer for some feature or anything.',
	usage: 'suggestion <msg>',
	category: 'General'
}