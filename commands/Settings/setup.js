exports.run = async (client, msg, args) => {
	if(!msg.member.hasPermission(`MANAGE_GUILD`)) return msg.channel.send(':x: | You need **Manage Server** permission to run this command!');
	const pronounce = [
		{
			message: `Hello ${msg.author}, I'm Bob. I will help you with your setup. Are you ready? Answer: **Yes**  /  **No**`,
			filter: mess => ['yes', 'no'].includes(mess.content.toLowerCase()) && mess.author.id === msg.author.id,
			action: {
				yes: (m) => 'continue',
				no: (m) => {
					msg.channel.send('Ok, goodbye! I will stay right here for you <3');
					return 'break';
				}
			}
		},
		{
			message: 'Excellent! Can you write down the name of the channel that you want me to play in? Answer: **Channel Name**',
			filter: (mess) => mess.author.id === msg.author.id,
			action: (m) => { client.commands.get('setchannel').run(client, msg, m.trim().split(/ +/g), true); return 'continue'; }
		},
		{
			message: 'Noice! Do you want to setup a custom prefix? **Yes**  /  **No**',
			filter: mess => ['yes', 'no'].includes(mess.content.toLowerCase()) && mess.author.id === msg.author.id,
			action: {
				yes: (m) => 'continue',
				no: (m) => {
					msg.channel.send('Ok, That\'s it! You can now enjoy my service. **NOTE: Because of memory leaks, you need to join to the voice channel first for the bot to appear!**');
					return 'break';
				}
			}
		},
		{
			message: 'Can you write down the prefix that you want to use? Answer: **Prefix** *(We can\'t allow you to have more than 3 characters in the prefix!)*',
			filter: (mess) => mess.author.id === msg.author.id,
			action: (m) => {client.commands.get('setprefix').run(client, msg, m.trim().split(/ +/g), true); return 'break'; }
		}
	];
	
	for(const pron of pronounce){
		await msg.channel.send(pron.message);
		const response = await msg.channel.awaitMessages(pron.filter, {max: 1, time: 30000});
		if(!response.size) return msg.channel.send('Oh no! It looks like im running out of time. Closing setup page!');
		let content = response.first().content;
		if(typeof pron.action === 'object'){
			const res = pron.action[content.toLowerCase()](content);
			if(res === 'break') break;
		}else{
			const res = pron.action(content);
			if(res === 'break') break;
		}
	}
}

exports.info = {
	name: 'setup',
	aliases: ['set'],
	description: 'Setup all bot settings',
	usage: 'setup',
	category: 'Settings'
}