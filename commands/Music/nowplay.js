const { RichEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

exports.run = async (client, msg, args) => {
	const song = client.radio.nowplay;
	const post = moment.duration(song.durationSeconds*1000).format('hh:mm:ss');
	const embed = new RichEmbed()
	.setColor('RED')
	.setAuthor('Now playing..', 'https://images-ext-1.discordapp.net/external/YwuJ9J-4k1AUUv7bj8OMqVQNz1XrJncu4j8q-o7Cw5M/http/icons.iconarchive.com/icons/dakirby309/simply-styled/256/YouTube-icon.png')
	.setTitle(song.title)
	.setURL(song.url)
	.setDescription(`**Duration:** \`${post}\`\n**Requested By:** ${song.isRequested ? song.requestedBy.tag : 'Music Manager'}\n**Listeners:** ${client.listener}`)
	.setFooter(`${client.songList.length || 0} songs are registered • ${client.footer}`)
	.setThumbnail(song.thumbnails.high.url);
	return msg.channel.send(embed);
}

exports.info = {
	name: 'nowplay',
	aliases: ['np'],
	description: 'Show now playing song',
	usage: 'nowplay',
	category: 'Music'
}