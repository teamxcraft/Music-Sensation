//this.changeRecent = new Set();


exports.run = async (client, msg, args, isSetup = false) => {

	
	if(!msg.member.hasPermission('MANAGE_GUILD')) return msg.channel.send(':x: | You need **Manage Server** permission to run this command!');
	//if(this.changeRecent.has(msg.author.id)) return msg.channel.send(`:x: | You must wait about **5** minutes since the last change!`);
	let mess = args.join(' ');
	client.sql.query(`SELECT * FROM ${client.config.db} WHERE guild = '${msg.guild.id}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		if(mess.toLowerCase() === 'none'){
			await client.sql.query(`DELETE FROM ${client.config.db} WHERE guild = '${msg.guild.id}'`);
			if(msg.guild.voiceConnection) await msg.guild.voiceConnection.channel.leave();
			if(!isSetup) await msg.channel.send(`:white_check_mark: | Radio channel has been deleted!`);
			return;
		}

		let channel = getChannel(msg, mess);

		if(!rows[0]){
			if(!mess) return msg.channel.send(`No connected voice channel! Please do \`${msg.prefix}setchannel (channel name)\``);
			if(!channel || (Array.isArray(channel) && !channel.length)) return msg.channel.send(`:x: | Sorry I couldn't find channel with the name \`${mess}\``);
			if(Array.isArray(channel) && channel.length > 1) return msg.channel.send(`:x: | Please more be specify : ${channel.join(', ')}`);
			if(Array.isArray(channel)) channel = channel[0];
			if(channel.type !== 'voice') return msg.channel.send(`:x: | That's not a voice channel! Please input a valid channel`);
			await client.sql.query(`INSERT INTO ${client.config.db} (guild, channel) VALUES ('${msg.guild.id}', '${channel.id}')`);
			//if(!client.owners.includes(msg.author.id)){
				//this.changeRecent.add(msg.author.id);
				//client.setTimeout(this.changeRecent.delete, 300000, msg.author.id);
			//}
		}else {
			if(!mess) return  msg.channel.send(`Channel is currently set in **${client.channels.get(rows[0].channel)}**. You need to join the voice channel first for the bot to appear!. To change it please use \`${msg.prefix}setchannel (name)\` or \`${msg.prefix}setchannel none\` to remove!`);
			let channel = getChannel(msg, mess);
			if(!channel || (Array.isArray(channel) && !channel.length)) return msg.channel.send(`:x: | Sorry I couldn't find channel with the name \`${mess}\``);
			if(Array.isArray(channel) && channel.length > 1) return msg.channel.send(`:x: | Please more be specify : ${channel.join(', ')}`);
			if(Array.isArray(channel)) channel = channel[0];
			if(channel.type !== 'voice') return msg.channel.send(`:x: | That's not a voice channel! Please input a valid channel`);
			if(msg.guild.voiceConnection) await msg.guild.voiceConnection.channel.leave();
			await client.sql.query(`UPDATE ${client.config.db} SET channel = '${channel.id}' WHERE guild = '${msg.guild.id}'`);
			//if(!client.owners.includes(msg.author.id)){
				//this.changeRecent.add(msg.author.id);
				//client.setTimeout(this.changeRecent.delete, 300000, msg.author.id);
			//}
		}
		if(!isSetup) {
			//if(!client.owners.includes(msg.author.id)){
				//this.changeRecent.add(msg.author.id);
				//client.setTimeout(this.changeRecent.delete, 300000, msg.author.id);
			//}
			msg.channel.send(`:white_check_mark: | Radio channel has been set to **${channel.name}**. You need to join/rejoin the channel for the bot to appear`);
		
		}
	});
}

function getChannel(msg, input){
	const CHANNEL_PATERN = /^(?:<#)?([0-9]+)>?$/g;
	if(CHANNEL_PATERN.test(input)) input = input.replace(CHANNEL_PATERN, '$1');
	if(!isNaN(input)) return msg.guild.channels.get(input);
	if(msg.guild.channels.map(x => x.name).includes(input)) return msg.guild.channels.find(x => x.name === input);
	const channels = msg.guild.channels.filter(x => x.name.toLowerCase().includes(input.toLowerCase()));
	return [...channels.values()];
}

exports.info = {
	name: 'setchannel',
	aliases: ['setchan'],
	description: 'Set the current voice channel for the bot.',
	usage: 'setchannel <channel>',
	category: 'Settings'
}