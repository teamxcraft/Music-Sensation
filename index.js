const Client = require('./class/Client.js');
const YouTube = require('simple-youtube-api');
const Enmap = require('enmap');
const ytdl = require('ytdl-core-discord');
const { Util } = require('discord.js')

const client = new Client({ disableEveryone: true });
const youtube = new YouTube('AIzaSyC8GHxFJ17uRpUYuyUngZ4lrlWNV_P85-w');
var isplay;

client.memcache = new Enmap({ name: 'cache' });

client.on('error', err => console.error('[DISCORD ERROR] ', err));
client.on('warn', wrr => console.warn('[DISCORD WARN] ', wrr));
client.on('disconnect', () => console.log('[DISCORD DISCONNECT] ', 'I just disconnected, making sure you know, I will reconnect now...'));
client.on('reconnecting', () => console.log('[DISCORD RECONNECTING] ', 'I am reconnecting now!'));

client.on('ready', async () => {
	if(client.user.id === '526647243466604564') client.setInterval(postStats, 900000);
	client.setInterval(updateListener, 30000);
	client.setInterval(playcheck, 10000);
	reQueue();
	console.log('[DISCORD INFO] ', `Logged as ${client.user.tag}. with ${client.guilds.size} guilds!`);
	client.setTimeout(procRest, 1.08e+7);
	if(client.voiceConnections && client.voiceConnections.size) client.voiceConnections.forEach(x => x.channel.leave());
	await rejoin();
	return play();
});

client.on('guildDelete', guild => {
	client.sql.query(`SELECT * FROM ${client.config.db}`, async (err, rows) =>{
		if(err) return console.error('[MySQL ERROR] ', err);
		if(rows[0]) await client.sql.query(`DELETE FROM ${client.config.db} WHERE guild = '${guild.id}'`);
		return client.channels.get('539803690891083777').send(`:outbox_tray: | I have been kicked from **${guild.name}** **(${guild.id})**.`);
	});
});

client.on('guildCreate', guild => client.channels.get('539803690891083777').send(`:inbox_tray: | I have been invited to **${guild.name}** **(${guild.id})**.`));

client.on('message', async msg => {
	if(msg.author.bot || !msg.guild) return;
	client.sql.query(`SELECT * FROM ${client.config.prefixdb} WHERE guild = '${msg.guild.id}'`, async (err, rows) => {
		if (err) return console.error('[MySQL ERROR] ', err);
		msg.prefix = await rows[0] ? rows[0].prefix : client.config.prefix;
	});
	client.setTimeout(() => {
		if(msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>`) 
		return msg.channel.send(`My prefix is \`${msg.prefix}\` To change it do \`${msg.prefix}prefix (prefix)\` `);
		if(!msg.content.startsWith(msg.prefix)) return;
		const args = msg.content.slice(msg.prefix.length).trim().split(/ +/g);
		const cmd = args.shift().toLowerCase();
		if(client.commands.has(cmd) || client.aliases.has){
			try{
				const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
				try{ command.run(client, msg, args)} catch { return;};
			}catch(e){
				return msg.channel.send(e.stack || e, { code: 'ini' });
			}
		}
	}, 500);

});

client.on('messageReactionAdd', async (reaction, user) => {
	if(!['❌', '✅', '👎'].includes(reaction.emoji.name)) return;
	if(!client.musicmanager.includes(user.id)) return;
	const msg = reaction.message;
	const reqSong = client.requestedSongs.get(msg.id);
	const channel = client.channels.get(reqSong.chn);
	const author = client.users.get(reqSong.usr);
	if(!reqSong) return;
	client.requestedSongs.delete(reqSong.id);
	msg.reactions.filter(x => x.emoji.name !== reaction.emoji.name).forEach(x => x.remove());
	if(reaction.emoji.name === '❌'){
		await channel.send(`:x: | ${author}, Your song with the url **${reqSong.title}** has been **DECLINED**! This is due to missmatch with the genre or inappropriate.`);
		await client.sql.query(`INSERT INTO ${client.config.table} (url, accept, oot) VALUES ('${reqSong.song}', false, false)`);
		return;
	}else if(reaction.emoji.name === '👎'){
		await channel.send(`:x: | ${author}, Your song **${reqSong.title}** has been **DECLINED**! Please check that you are requesting based on the bot **genre!**`);
		await client.sql.query(`INSERT INTO ${client.config.table} (url, accept, oot) VALUES ('${reqSong.song}', false, true)`);
		return;
	}
	await channel.send(`:white_check_mark: | ${author}, Your song **${reqSong.title}** has been **ACCEPTED** and will be played after this song!`);
	 await client.sql.query(`INSERT INTO ${client.config.table} (url, accept, oot) VALUES ('${reqSong.song}', true, false)`);
	const song = await youtube.getVideo(reqSong.song);
	song.isRequested = true;
	song.requestedBy = author;
	if(!client.queues.map(x => x.isRequested).includes(true)) return client.queues.unshift(song);
	for(let i = client.queues.length-1; i >= 0; i--)
		if(client.queues[i].isRequested) return client.queues.splice(i+1, 0, song);
});

client.on('voiceStateUpdate', async (oldMember, newMember,)  =>{
	const newUserChannel = newMember.voiceChannel;
	const oldUserChannel = oldMember.voiceChannel;
	if(newUserChannel === undefined || oldUserChannel && newUserChannel && oldUserChannel.id != newUserChannel.id){
		client.sql.query(`SELECT * FROM ${client.config.db} WHERE guild ='${oldMember.guild.id}'`, async (err,rows)=>{
			if(err) return console.error('[MySQL ERROR] ', err);
			if(!rows[0]) return;
			//await new Promise(resolve => setTimeout(resolve, 500));
			let chn = await rows[0].channel;
			if(oldUserChannel.id === chn){
				let chns = await client.channels.get(chn);
				let channel = await client.channels.get(chn);
				let check2 = await channel.members.size;
				if(check2 - 1 > 0) return;
				try {
					await chns.leave();
				} catch (e) {
					return console.log(e);
				};
			};
		});
	};
	
	if(oldUserChannel === undefined || oldUserChannel != newUserChannel && newUserChannel !== undefined) {
		client.sql.query(`SELECT * FROM ${client.config.db} WHERE guild = '${newMember.guild.id}'`,async (err, rows) =>{
			if(err) return console.error('[MySQL ERROR] ', err);
			if(!rows[0]) return;
			//wait new Promise(resolve => setTimeout(resolve, 500));
			let chn = await rows[0].channel;
			if(newUserChannel.id === chn){
				try{
					let chns = await client.channels.get(chn);
					if(!chns.permissionsFor(client.user).has(['SPEAK', 'CONNECT'])) return;
					let vc = client.voiceConnections.get(newMember.voiceChannel.id);
					if(vc) return;

					joinVoiceChannel(chns, newMember.voiceChannel.guild.id);
				} catch (err){
					console.error('[DISCORD ERROR] ', err);
					return;
				}
			}
		});
	}
});

client.replay = play;

async function joinVoiceChannel(channel, guild){
	//await new Promise(resolve => setTimeout(resolve, 1500));
	try {
		const connection = await channel.join();
		console.log(`Connected to ${guild}`)
		connection.playBroadcast(client.radio);{

		connection.dispatcher.volumeAmped = 100;
		connection.dispatcher.setVolumeLogarithmic(connection.dispatcher.volumeAmped/100);
		return;
		}
	}catch(err){
		console.error('[DISCORD ERROR] ', err);
		return;
	}
}

async function play(){
	await new Promise(resolve => setTimeout(resolve, 2000));
	while(client.queues.length <= 31){
		const song = await getRandomSong();
		if(client.queues.map(x => x.url).includes(song.url)) continue;
		const titlev2 = song.title.replace(/[`~@#$%^*_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
		await client.sql.query(`INSERT INTO queue (title, link, bot, time) VALUES ('${titlev2}', '${song.url}', '${client.user.id}', ${Date.now()})`);
		client.queues.push(song);
		isplay = true
	}
	let song;
	try{
		[ song ] = client.queues;
		client.radio.nowplay = song;
		client.queues.shift();
		client.sql.query(`DELETE FROM queue WHERE link = '${song.url}' AND bot = '${client.user.id}'`);

	// await client.radio.playStream(ytdl(song.url), {quality: 'highestaudio', highWaterMark: 1024 * 1024 * 52});
	// client.radio.once('end', play);
	// client.radio.once('error', play);

		await new Promise(resolve => setTimeout(resolve, 2000));
		client.radio.playOpusStream(await ytdl(song.url), {quality: 'highestaudio', highWaterMark: 1024 * 1024 * 512});
		client.radio.once(await 'end', play);
		client.radio.once(await 'error', (err) => {
			console.log('[PLAY ERROR EVENT]', err);
			return play;
		})
	}catch(err){
		isplay = false
		console.log('[PLAY ERROR]', err);
		console.log(song.url);
		client.queues.shift();
		return play;
	}
	
	await client.user.setActivity(`${song.title}`, { type: 'PLAYING'});
	client.sql.query(`SELECT * FROM nowplay WHERE bot = '${client.user.id}'`, async (err, rows) => {
		if (err) console.error('[MySQL ERROR] ', err);
		const titlev = song.title.replace(/[`~@#$%^*_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
		if(!rows[0]) client.sql.query(`INSERT INTO nowplay (title, link, bot, request) VALUES ('${titlev}', '${song.url}', '${client.user.id}', '${song.isRequested ? song.requestedBy.tag : 'Music Manager'}')`);
		client.sql.query(`UPDATE nowplay SET title = '${titlev}', link = '${song.url}', request = '${song.isRequested ? song.requestedBy.tag : 'Music Manager'}' WHERE bot = '${client.user.id}'`);
	});
}

async function getRandomSong(){
	const song = client.songList[Math.floor(Math.random()*client.songList.length)];
	try{
		const sgl = await youtube.getVideo(song)
		return sgl;
	}catch(err){
		console.log(`[RANDOM SONG]`, err)
		return getRandomSong();
	}
}

function postStats(){
	client.sql.query('SELECT 1');
	try{
		client.dbl.postStats(client.guilds.size);
	}catch(err){
		console.error('[DBL ERROR] ', err);
	}
}

function playcheck(){
	if(!isplay) return play();
}

function updateListener(){
	try {
		const list = client.voiceConnections.map(x => x.channel.members.filter(m => !m.user.bot).map(x => x.user.tag)).reduce((a,b) => a.concat(b));
		if(list) client.listener = list.length
		else client.listener = 0;
		client.sql.query(`SELECT * FROM listener WHERE bot = '${client.user.id}'`, (err, rows) => {
			if(err) return console.error('[MySQL ERROR] ', err);
			if(!rows[0]) return client.sql.query(`INSERT INTO listener (bot, listener) VALUES ('${client.user.id}', ${client.listener})`);
			client.sql.query(`UPDATE listener SET listener = ${client.listener} WHERE bot = '${client.user.id}'`);
		});
	}catch(e){
//		return console.error('[LISTENER ERRROR]', e);
		return;
	}
}

function reQueue(){
	client.user.setActivity('Booting.....', { type: 'PLAYING' });
	client.sql.query(`DELETE FROM queue WHERE bot = '${client.user.id}'`);
}

function procRest(){
	client.memcache.set('onvc', client.voiceConnections.map(x => x.channel.id) || []);
	process.exit(0);
}

async function rejoin(){
	const vcs = client.memcache.get('onvc');
	if(!vcs || !vcs.length) return;
	for(const vc of vcs){
		const voiceChannel = client.channels.get(vc);
		if(voiceChannel.members.size) await joinVoiceChannel(voiceChannel, voiceChannel.guild.id);
	}
	return client.memcache.delete('onvc');
}

client.setup();
process.on('unhandledRejection', err => {
	console.error(err)
	return;
});

process.on('uncaughtException', err => {
	console.error(err)
	return;
});
process.on('removeListener', err => {
	console.error(err)
	return;
});
process.on('multipleResolves', err => {
	console.error(err)
	return;
});