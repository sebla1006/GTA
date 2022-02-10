const { MessageEmbed } = require("discord.js")

const error = (message, success) => {
    const embed = new MessageEmbed()
    .setTitle(success ? "Succès" : "Erreur")
    .setDescription(`${message}`)
    return embed
}

module.exports = {
    error
}