const { guildId, reportBugChannelId } = require('../config.json')

const reportBug = (message) => {
    if(message.client.bug.includes(message.author.id)) return message.channel.send(`:x: Merci d'attendre que le staff réponde à votre report de bug.`)


    message.channel.send("Veuillez envoyer la raison :slight_smile:. __Attention__ : Vous avez 60 secondes au maximum")
    message.client.general.push(message.author.id)
    message.channel.awaitMessages({max: 1, filter: m => m.author.id === message.author.id, time: 60_000})
    .then(async collected => {
        const mess = collected.first()

        message.client.general.splice(message.client.general.indexOf(message.author.id), 1)
        message.client.bug.push(message.author.id)
        message.channel.send(`Votre message a été réçu et transmis à l'équipe du staff. Pendant ce temps vous ne pourrez pas réutiliser cette commande.`)

        
        const guild = await message.client.guilds.fetch(guildId)
        const channel = await guild.channels.fetch(reportBugChannelId)

        channel.send(`${message.author} "${mess.content}"`)

    })
    .catch( (error) => {
        message.client.general.splice(message.client.general.indexOf(message.author.id), 1)
        message.channel.send(`Vous avez mis trop de temps à répondre.`)
        console.log(error)
    });
}



module.exports = {
    reportBug
}