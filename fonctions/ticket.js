const { MessageEmbed } = require("discord.js");
const { reportBug } = require("./functions");
const { guildId, ticketCategoryChannelId } = require('./../config.json')

    
const ticketFirst = async (message) => {
    const embed = new MessageEmbed()
       .setTitle("Menu")
       .setDescription(`Réagissez au message avec la réaction convient à votre demande : \n🎫: Créer un ticket\n🔍: Report bug/problème\n❌: Annuler\n\n *Veuillez noter que vous avez 60 secondes pour cliquer sur la réaction sinon la réaction ne fonctionnera plus.`)
    message.channel.send({embeds: [embed]})
       .then(async mess => {
           let m = await message.channel.send(`<a:Loading:773644834031665234> Veuilez patienter avant de réagir. Réactions en cours d'ajout.`);
           await mess.react("🎫");
           await mess.react("🔍");
           await mess.react("❌");
           await m.delete();

           const possibleReaction = ["🎫", "🔍", "❌"]

           mess.awaitReactions({ max: 1, filter: (reaction, user) => possibleReaction.includes(reaction.emoji.name), time: 60_000})
            .then(collected => {
                const reaction = collected.first();
                switch(reaction.emoji.name){
                    case "🎫":
                        ticket(message);
                        break;
                    case "🔍":
                        reportBug(message);
                        break;
                    case "❌":
                        message.channel.send(`Le programme s'est arrété correctement.`)
                        break;
                }
            })
            .catch( (erreur) => {
                console.log(erreur)
                return message.channel.send({ embeds: [error(`Le temps est imparti **OU** une erreur est survenue lors du programme contacter Sebla#1006 pour plus d'informations.`)]});
            });
        })
}

const ticket = async (message) => {
    if(message.client.usersTicket.includes(message.author.id)) return message.channel.send(`:x: Un ticket est déjà en cours, veuillez patienter.`)

    message.channel.send(`Vous venez de créer un ticket le staff vous répondra dés que possible.`)
    // [ [idL'auteur, idChannel] ]
    const guild = await message.client.guilds.fetch(guildId)
    const category = await guild.channels.fetch(ticketCategoryChannelId)
    try{
        const channel = await guild.channels.create(message.author.username, {
            parent: category
        });

        const embed = new MessageEmbed()
            .setTitle(`Ticket : ${message.author.username}`)
            .setDescription(`Pour fermer le ticket utilisez \`!close\`\nPour envoyer un message à l'utilisateur il suffira d'envoyer un message dans ce salon, il lui sera retransmis.`)
        channel.send({embeds: [embed]});
        message.client.ticket.push([message.author, channel]);
        message.client.usersTicket.push(message.author.id)
    }catch(err) {
        console.log(err)
        message.channel.send(`Il y a eu une erreur lors de la création du salon ticket. Un manque de permission est une erreur très probable !`)
    }
    
}

module.exports = {
    ticketFirst,
    ticket
}