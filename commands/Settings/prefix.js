exports.run = async (client, msg, args, isSetup = false) => {
	// let mess = args.join(' ');

	if(args[0] === 'set'){
		if(!msg.member.hasPermission('MANAGE_GUILD')) return msg.channel.send(':x: | You need **Manage Server** permission to run this command!');
		if(!args[1]) return msg.channel.send(`:x: | Please input a prefix you want to set \`${msg.prefix}prefix set (prefix)\``);
		if(args[1].length > 3) return msg.channel.send(`:x: | Your prefix is to long! Max **3** characters`);
		client.sql.query(`SELECT * FROM ${client.config.prefixdb} WHERE guild = '${msg.guild.id}'`, async (err, rows) =>{
			if(err) return console.error('[MySQL ERROR] ', err);
			if(!rows[0]) await client.sql.query(`INSERT INTO ${client.config.prefixdb} (guild, prefix) VALUES ('${msg.guild.id}', '${args[1]}')`);
			else await client.sql.query(`UPDATE ${client.config.prefixdb} SET prefix = '${args[1]}' WHERE guild = '${msg.guild.id}'`);
			if(isSetup) return msg.channel.send('You are all setup. Enjoy my service! If you have any question, please join our support!');
			msg.channel.send(`:white_check_mark:  | Successfully change the prefix to \`${args[1]}\` `);
		});
		return
	}
	client.sql.query(`SELECT * FROM ${client.config.prefixdb} WHERE guild = '${msg.guild.id}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		if(!rows[0]) return msg.channel.send(`My prefix on this server is ${client.config.prefix}. To change the prefix please do \`${client.config.prefix}prefix set (prefix)\``);
		msg.channel.send(`My prefix on this server is ${rows[0].prefix}. To change the prefix please do \`${rows[0].prefix}prefix set (prefix)\` `);
	});


	return;



}

exports.info = {
	name: 'prefix',
	aliases: [],
	description: 'Change prefix',
	usage: 'prefix <new prefix>',
	category: 'Settings'
}