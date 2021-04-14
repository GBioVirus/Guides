const Discord = require('discord.js')
const fs = require('fs') // Подключаем файловую систему
const bot = new Discord.Client()
const config = require('./config.json')
bot.commands = new Discord.Collection() // Коллекция команд
const exp = require('./functions/exp.js')

fs.readdir('./commands', (err, files) => { // Чтение commands
    if (err) console.log(err)

    let jsfile = files.filter(f => f.split('.').pop() === 'js') // фильтр .js игнорируются все кроме данного расширения
    if (jsfile.length <= 0) return console.log('Команды не найдены!') // если нет ни одного файла с расширением .js

    console.log(`Loaded ${jsfile.length} commands`)
    jsfile.forEach((f, i) => { // Каждая команда в коллекции
        let props = require(`./commands/${f}`)
        bot.commands.set(props.help.name, props)
    })
})

bot.on('message', async message => {
    let prefix = config.prefix
    let messageArray = message.content.split(' ') // Пробел в командах
    let command = messageArray[0] // данные после префикса
    let args = messageArray.slice(1) // аргументы команды
    let command_file = bot.commands.get(command.slice(prefix.length)) // вызов команды
    if (command_file) command_file.run(bot, message, args)

    await exp(message.author)
})

bot.on('messageUpdate', async (oldmsg, newmsg) => {
	 let embed = new Discord.RichEmbed()
		.setAuthor('Сообщение изменено', newmsg.guild.iconURL)
		.addField('Отправитель', oldmsg.member, true)
		.addField('Канал', oldmsg.channel, true)
		.addField('Раньше', oldmsg.content)
		.addField('Сейчас', newmsg.content)
		.setColor(0xe19517)
		.setTimestamp()
	await oldmsg.channel.send(embed)
})

bot.on('messageDelete', async message => {
    let embed = new Discord.RichEmbed()
        .setAuthor('Сообщение удалено', message.guild.iconURL)
        .addField('Отправитель', message.member, true)
        .addField('Канал', message.channel, true)
        .addField('Содержание', message.content)
        .setColor(0xf04747)
        .setTimestamp()
    await message.channel.send(embed)
})

bot.on('guildMemberAdd', async member => {
    let role = member.guild.roles.find(r => r.name == 'Community')
    let channel = member.guild.channels.find(c => c.name == 'actions')

    let embed =  new Discord.RichEmbed()
        .setAuthor('Участник присоединился', member.user.avatarURL)
        .setDescription(`${member.user.username}#${member.user.discriminator} (${member})`)
        .setColor(0x41b581)
        .setFooter(`ID: ${member.id}`)
        .setTimestamp()
    await channel.send(embed)
    await member.addRole(role.id)
})

bot.on('guildMemberRemove', async member => {
    let embed = new Discord.RichEmbed()
        .setAuthor('Участник вышел', member.user.avatarURL)
        .setDescription(`${member.user.username}#${member.user.discriminator} (${member.id})`)
        .setColor(0xf04747)
        .setFooter(`ID: ${member.id}`)
        .setTimestamp()
    let channel = member.guild.channels.find(c => c.name == 'actions')
    await channel.send(embed)
})

bot.login(config.token)
bot.on('ready', () => {
    console.log(`${bot.user.username} online`);
    bot.user.setPresence({status: 'dnd', game:{name: 'test', type: 0}})
})