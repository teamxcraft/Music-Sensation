exports.run = async (client, msg, args) => {
	if(!client.owners.includes(msg.author.id)) return;
	client.sql.query(`SELECT * FROM ${client.config.db} WHERE guild = '${args[0]}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		if(!rows[0]){
			client.sql.query(`INSERT INTO ${client.config.db} (guild, channel) VALUES ('${args[0]}', '${args[1]}')`);
			return msg.channel.send('YAY!!');
		} else {
			client.sql.query(`UPDATE ${client.config.db} SET channel = '${args[1]}' WHERE guild = '${args[0]}'`);
			msg.channel.send('Yes master!');
		}
	});
}

exports.info = {
	name: 'adminchannel',
	aliases: ['admchan'],
	description: 'YAYY!!! EASTER EGG!!!',
	usage: 'adminchannel',
	category: null
}