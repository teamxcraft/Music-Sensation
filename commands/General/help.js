const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	if(args[0]){
		const cmd = client.commands.get(args[0].toLowerCase());
		if(!cmd) return this.run(client, msg, []);
		const embed = new RichEmbed()
		.setColor('RANDOM')
		.setDescription(`
ℹ️ | Information for command **${cmd.info.name}**
◽ | Description:
\`\`\`${cmd.info.description}\`\`\`
◽ | Aliases: ${cmd.info.aliases.length ? cmd.info.aliases.map(x => `**${x}**`).join(', ') : 'no aliases'}
◽ | Usage: **${msg.prefix}${cmd.info.usage}**
◽ | Category: **${cmd.info.category}**
		`);
		return msg.channel.send(embed);
	}
	const embed = new RichEmbed()
	.setColor('RANDOM')
	.setAuthor('Here are some useful commands for you!', client.user.displayAvatarURL)
	.addBlankField()
	.setDescription(`My prefix on this server is \`${msg.prefix}\` | Report any bugs to my developers! \`${msg.prefix}bug\``);
	for(const cate of [...new Set(client.commands.map(x => x.info.category).filter(x => x))])
		embed.addField(cate, client.commands.filter(x => x.info.category === cate).map(x => `\`${msg.prefix}${x.info.name}\``).join(', '));
	embed.addBlankField()
	.addField('Other Bot', '[Music Sensation](https://discordapp.com/oauth2/authorize?client_id=526647243466604564&permissions=16050240&scope=bot)\n[Music Sensation Kpop](https://discordapp.com/oauth2/authorize?client_id=526709083957362688&permissions=16050240&scope=bot)\n[Music Sensation Jpop](https://discordapp.com/oauth2/authorize?client_id=526709612175425537&permissions=16050240&scope=bot)\n[Music Sensation LoFi](https://discordapp.com/oauth2/authorize?client_id=536333443152347137&permissions=16050240&scope=bot)\nMore Soon!', true)
	.addField('Useful Links', `[Website](https://thegamersnations.org/)\n[Invite Link](${client.config.invitelink})\n[Support Server](https://discordapp.com/invite/XE8bjRk)\n[Vote](https://thegamersnations.org/vote)`, true)
	.setFooter(client.footer);
	return msg.channel.send(embed);
}

exports.info = {
	name: 'help',
	aliases: ['h'],
	description: 'Show all command',
	usage: 'help [command]',
	category: 'General'
}