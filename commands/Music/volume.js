exports.run = async (client, msg, args) => {
	client.sql.query(`SELECT * FROM ${client.config.volumedb} WHERE guild = '${msg.guild.id}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		let vol;
		if(args[0]) vol = parseInt(args[0], 10);
		if(!rows[0] && !args[0]) await client.sql.query(`INSERT INTO ${client.config.volumedb} (guild, vl) VALUES ('${msg.guild.id}', 100)`);
		if(!rows[0] && args[0]){
			await client.sql.query(`INSERT INTO ${client.config.volumedb} (guild, vl) VALUES ('${msg.guild.id}', ${args[0]})`);
			msg.guild.voiceConnection.dispatcher.volumeAmped = await vol;
			msg.guild.voiceConnection.dispatcher.setVolumeLogarithmic(vol/100);
			return msg.channel.send(`🔊 | Volume set to **${args[0]}%**`);
		}
		if(!args[0]) return msg.channel.send(`🔊 | Volume is at **${rows[0].vl}%**`);
		if(isNaN(args[0])) return msg.channel.send(`:x: | You can only input **NUMBER!**`);
		if(args[0] > 100 || args[0] < 10) return msg.channel.send(`:x: | You can only input from **10 - 100%**`);
		await client.sql.query(`UPDATE ${client.config.volumedb} SET vl = ${args[0]} WHERE guild = '${msg.guild.id}'`);
		msg.channel.send(`🔊 | Volume set to **${args[0]}%**`);
		msg.guild.voiceConnection.dispatcher.volumeAmped = await vol;;
		msg.guild.voiceConnection.dispatcher.setVolumeLogarithmic(await vol/100);
	});
}

exports.info = {
	name: 'volume',
	aliases: ['vol'],
	description: 'Set the current volume.',
	usage: 'volume <value>',
	category: 'Music'
}