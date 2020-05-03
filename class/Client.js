const Enmap = require('enmap');
const { Client, Collection } = require('discord.js');
const { readdirSync, statSync, readFileSync } = require('fs');
const DBL = require('dblapi.js');
const path = require('path');
const mysql = require('mysql');

class MusicClient extends Client {
	constructor(...args){
		super(...args);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.requestedSongs = new Enmap({ name: 'requested-songs' });
		this.dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyNjY0NzI0MzQ2NjYwNDU2NCIsImJvdCI6dHJ1ZSwiaWF0IjoxNTQ3NjM4NzQ3fQ.Hgi3UtBPpEe_4zdTueDcpWs2Q8GNSNtq4vCtNeA6D24');
		this.radio = null;
		this.sql = null;
		this.queues = [];
		this.listener = 0;
		this.config = require('../config.json');
		this.songList = readFileSync(path.join(__dirname, '../song.txt'), 'utf8').split('\n');
		this.owners = ['186702772807270401', '427473949476126740'];
		this.musicmanager = ['186702772807270401', '427473949476126740', '274135854245609472', '304377187057008645', '443364097145176064'];
		this.footer = '© Copyright 2019 Music Sensation v2.2 BETA';
	}
	
	setup(){
		this.registryCommands();
		this.connectMySQL();
		this.once('ready', () => this.radio = this.createVoiceBroadcast());
		return this.login(process.env.BOT_TOKEN);
	}
	
	registryCommands(){
		const files = this.readdirRecursive(path.join(__dirname, '../commands'));
		console.log('[COMMAND INFO] ', `${files.length} detected.`);
		for(const file of files){
			const required = require(file);
			if(!required.run || !required.info) continue;
			this.commands.set(required.info.name, required);
			for(const alias of required.info.aliases){
				this.aliases.set(alias, required.info.name)
			}
		}
	}
	
	connectMySQL(){
		this.sql = mysql.createConnection({
			host: process.env.MYSQL_IP,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PW,
			database: process.env.MYSQL_DB,
			charset: 'utf8mb4'
		});
		
		this.sql.connect(err => {
			if(err) return console.error('[MySQL ERROR] ', err);
			return console.log('[MySQL INFO] ', 'Connected to database!');
		});
		
		this.sql.on('error', err => console.error('[MySQL ERROR] ', err));
	}
	
	readdirRecursive(dir){
		const files = readdirSync(dir);
		let results = [];
		for(const file of files){
			const module = path.join(dir, file);
			if(statSync(module).isDirectory()){
				const res = this.readdirRecursive(module);
				results = results.concat(res);
			} else {
				if(!file.endsWith('.js')) continue;
				results.push(module);
			}
		}
		return results;
	}
}

module.exports = MusicClient;
