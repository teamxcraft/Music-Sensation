exports.run = async (client, msg, args, isSetup = false) => {
	if(!msg.member.hasPermission('MANAGE_GUILD')) return msg.channel.send(':x: | You need **Manage Server** permission to run this command!');
	if(!args[0]) return msg.channel.send(`:x: | Please input a prefix you want to set \`${msg.prefix}prefix (prefix)\``);
	if(args[0].length > 3) return msg.channel.send(`:x: | Your prefix is to long! Max **3** characters`);
	client.sql.query(`SELECT * FROM ${client.config.prefixdb} WHERE guild = '${msg.guild.id}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		if(!rows[0]) await client.sql.query(`INSERT INTO ${client.config.prefixdb} (guild, prefix) VALUES ('${msg.guild.id}', '${args[0]}')`);
		else await client.sql.query(`UPDATE ${client.config.prefixdb} SET prefix = '${args[0]}' WHERE guild = '${msg.guild.id}'`);
		if(isSetup) return msg.channel.send('You are all setup. Enjoy my service! If you have any question, please join our support!');
		msg.channel.send(`:white_check_mark:  | Successfully change the prefix to \`${args[0]}\` `);
	});
}

exports.info = {
	name: 'setprefix',
	aliases: ['sp'],
	description: 'Change prefix',
	usage: 'setprefix <new prefix>',
	category: 'Settings'
}