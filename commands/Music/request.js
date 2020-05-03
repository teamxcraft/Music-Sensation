const { RichEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube('AIzaSyC8GHxFJ17uRpUYuyUngZ4lrlWNV_P85-w');

this.talkedRecently = new Set();

exports.run = async (client, msg, args) => {
	let isVoted = await client.dbl.hasVoted(msg.author.id);
	if(client.owners.includes(msg.author.id)) isVoted = true;
	if(!isVoted) return msg.reply(`:x: | You haven't vote in the past 24 hours! To request a song please vote first via this link <https://musicsensation.xyz/vote>. If you have voted, please wait while it process! will be aroun 10-15 minutes `);
	if(this.talkedRecently.has(msg.author.id)) return msg.channel.send(`:x: | You must wait about **5** minutes since the last request!`);
	let mess = args.join(' ');
	let mi = mess.includes(`youtube`) || mess.includes(`youtu.be`);
	if(!mess) return msg.channel.send(`:x: | Please type the youtube link or title that you want to request!`);
	let sung;
	
		if(!args[0].startsWith("http")){
		try{
			const videoes = await youtube.searchVideos(mess, 1);
			sung = await youtube.getVideo(videoes[0].url);
		}catch(err){
			try{
				const videos = await youtube.searchVideos(mess, 1);
				const message = await msg.channel.send(`?? Searching for **${mess}** in Youtube!`);
				sung = await youtube.getVideo(videos[0].url);
				await message.delete();
			}catch(e){
				console.error('[FETCH ERROR] ', e);
				return msg.channel.send(`:x: |  Can't Find any Video with the title \`${mess}\``);
			}
		}
	}
	
	if(args[0].startsWith("http")){
		sung = await youtube.getVideo(mess);
	}
	 if(!client.owners.includes(msg.author.id)){
	 	this.talkedRecently.add(msg.author.id);
	 	client.setTimeout(this.talkedRecently.delete, 300000, msg.author.id);
	}
	client.sql.query(`SELECT * FROM ${client.config.table} WHERE url = '${sung.url}'`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		const embed = new RichEmbed()
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
		.setURL(sung.url)
		.setTitle(sung.title)
		.setImage(sung.thumbnails.high.url)
		.setFooter(msg.guild.name)
		.setTimestamp();
		if(!rows[0]){
			embed.setColor(`#63ff44`);
			const reqMess = await client.channels.get(`526648648885600267`).send(embed);
			await msg.channel.send(`:white_check_mark: | Thank you ${msg.author}! Your request is being evaluated by our music manager. You will be notified if it's done!`);
			await reqMess.react('✅');
			await reqMess.react('❌');
			await reqMess.react('👎');
			await client.requestedSongs.set(reqMess.id, { id: reqMess.id, song: sung.url, chn: msg.channel.id, usr:msg.author.id, title:sung.title } );
		}else if(rows[0].accept){
			await msg.channel.send(`:white_check_mark: | ${msg.author}, Your song **(${sung.title})** is automatically **ACCEPTED!** Because someone already request the song previously`);
			embed.setDescription('```This song has been automatically accept, because someone already request the song previously```')
			.setColor('BLUE');
			client.channels.get(`526648648885600267`).send(embed);
			const song = await youtube.getVideo(sung.url);
			song.isRequested = true;
			song.requestedBy = msg.author;
			if(!client.queues.map(x => x.isRequested).includes(true)) return client.queues.unshift(song);
			for(let i = client.queues.length-1; i >= 0; i--)
				if(client.queues[i].isRequested) return client.queues.splice(i+1, 0, song);
		}else if(rows[0].oot) return msg.channel.send(`:x: | ${msg.author}, Your song **(${sung.title})** is automatically **DECLINED!** Because someone already request the song previously and it's not the right genre! Please do ${msg.prefix}about`);
		else if(!rows[0].accept) return msg.channel.send(`:x: | ${msg.author}, Your song **(${sung.title})** is automatically **DECLINED!** Because someone already request the song previously and we denied it.`);
		else msg.channel.send(`:x: | An error has been occurred!`);
	});
}

exports.info = {
	name: 'request',
	aliases: ['req'],
	description: 'Req some song to add into queue',
	usage: 'request <url | title>',
	category: 'Music'
}