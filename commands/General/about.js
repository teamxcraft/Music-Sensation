const moment = require('moment');
require('moment-duration-format');
const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	let api_ms = (Date.now() - msg.createdTimestamp * 1) 
	let duration = moment.duration(client.uptime).format('D [days], H [hrs], m [mins].');
	let mcount = client.songList.length || 0;
	const embed = new RichEmbed()
	.setColor('RANDOM')
	.setAuthor(`About ${client.user.tag}`, client.user.displayAvatarURL)
	.addField('Status', 'Online', true)
	.addField('Song Registered', `${mcount} songs`, true)
	.addField('Bot Version', '2.2 BETA', true)
	.addField('Prefix', `${msg.prefix}`, true)
	.addField('Server Connected', client.guilds.size.toLocaleString(), true)
	.addField('Channel Registered', client.channels.size.toLocaleString(), true)
	.addField('User Detected', client.users.size.toLocaleString(), true)
	.addField('Ping', `${api_ms.toFixed(0)} ms`, true)
	.addField('Memory consumed',`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB.`, true)
	.addField('Uptime', duration, true)
	.addBlankField()
	.addField('Other Bot', `[Music Sensation](https://discordapp.com/oauth2/authorize?client_id=526647243466604564&permissions=16050240&scope=bot)\n[Music Sensation Kpop](https://discordapp.com/oauth2/authorize?client_id=526709083957362688&permissions=16050240&scope=bot)\n[Music Sensation Jpop](https://discordapp.com/oauth2/authorize?client_id=526709612175425537&permissions=16050240&scope=bot)\n[Music Sensation LoFi](https://discordapp.com/oauth2/authorize?client_id=536333443152347137&permissions=16050240&scope=bot)\nMore Soon!`,true)
	.addField('Useful Links', `[Website](https://musicsensation.xyz/)\n[Invite Link](${client.config.invitelink})\n[Support Server](https://discordapp.com/invite/XE8bjRk)\n[Vote](https://musicsensation.xyz/vote)`, true)
	.addField('Developer', 'FatK#2359\nОwО#8287',true)
	.setFooter(client.footer);
	msg.channel.send(embed);
}

exports.info = {
	name: 'about',
	aliases: ['stats', 'info'],
	description: 'Give current stats about bot.',
	usage: 'about',
	category: 'General'
}