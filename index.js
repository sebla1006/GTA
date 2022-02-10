const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS], partials: ['CHANNEL']});
const { staffPermission, ticketCategoryChannelId } = require("./config.json");
const { ticket } = require('./fonctions/functions');
const { mute, unmute } = require('./fonctions/mutesFunctions');
const { ticketFirst } = require('./fonctions/ticket');
const { error } = require('./fonctions/useful');

client.login(process.env.TOKEN);

client.general = [];
client.bug = [];
client.ticket = [];
client.usersTicket = [];

client.on("ready", async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
   if(message.author.bot) return;

   if(((message.channel.parentId === ticketCategoryChannelId || (message.channel.type === "DM" && message.client.usersTicket.includes(message.author.id)))) || message.content.startsWith("!close")) return message.client.emit("ticket", (message))

    

    if(message.guild){
        if(message.content.startsWith("!mute")){

            const member = message.mentions.members.first();
            if(!member) return message.channel.send({ embeds: [error("Vous n'avez pas mentionné de membre")]});
            if(!message.member.permissions.has(staffPermission) || member.permissions.has(staffPermission)) return message.channel.send({ embeds: [error(`Vous n'avez pas l'autorisation nécessaire d'utiliser cette commande. **OU** ${member} ne peut pas être mute.`)]});
            if(member.roles.cache.find(role => role.name === "Muted")) return message.channel.send({ embeds: [ error(`Le membre est déjà mute.`) ]})

            await mute(message, member);

        }else if(message.content.startsWith("!unmute")){

            const member = message.mentions.members.first();
            if(!member) return message.channel.send({ embeds: [error("Vous n'avez pas mentionné de membre")]});
            if(!message.member.permissions.has(staffPermission) || member.permissions.has(staffPermission)) return message.channel.send({ embeds: [error(`Vous n'avez pas l'autorisation nécessaire d'utiliser cette commande. **OU** ${member} ne peut pas être unmute.`)]});
            if(!member.roles.cache.find(role => role.name === "Muted")) return message.channel.send({ embeds: [ error(`Le membre n'est pas mute.`) ]});

            await unmute(message, member);

        }else if(message.content.startsWith("!bug")){

            const member = message.mentions.members.first();
            if(!member) return message.channel.send({ embeds: [error("Vous n'avez pas mentionné de membre")]});
            if(!message.member.permissions.has(staffPermission)) return message.channel.send({ embeds: [error(`Vous n'avez pas l'autorisation nécessaire d'utiliser cette commande.`)]});
            if(!message.client.bug.includes(member.id)) return message.channel.send({ embeds: [error(`${member} n'a pas donné de bug.`)]});

            client.bug.splice(client.bug.indexOf(member.id), 1)
            message.channel.send(`L'utilisateur peut désormais réutiliser la commande bug.`)
        }


    }else {
        if(message.client.general.includes(message.author.id)) return;
        ticketFirst(message);
    }

   
});


client.on("ticket", (message) => {
    if(message.client.general.includes(message.author.id)) return

    let index = false
    let gIndex = 0
    for(I of message.client.ticket){
        if(I[0].id === message.author.id  || I[1].id === message.channel.id){
            index = I[1].id === message.channel.id ? 1 : 0
            break
        }
        gIndex++
    }
    if(index === false) return

    

    if(message.content.startsWith('!close')) {

        message.client.ticket[gIndex][0].send(`**${message.member.permissions.has("ADMINISTRATOR") ? "(Administrateur)" : "(Staff)"} ${message.author.username}:** ferme le ticket.`)
        message.client.ticket.splice(gIndex, 1)
        message.client.usersTicket.splice(message.client.usersTicket.indexOf(message.author.id), 1)
        message.channel.send(`Le ticket a été supprimé avec succès. Le salon sera supprimé dans 10 secondes.`)
        setTimeout(function(){
            message.channel.delete()
        }, 10000)
        

    }else if(index === 1){
        try{
           message.client.ticket[gIndex][0].send(`**${message.member.permissions.has("ADMINISTRATOR") ? "(Administrateur)" : "(Staff)"} ${message.author.username}:** ${message.content}`)
           message.channel.send(`:white_check_mark: Le message a été envoyé avec succès.`)
        }catch(err) {
            console.log(err)
        }   
    }else {
        try{
            const embed = new MessageEmbed()
                .setTitle(`Menu`)
                .setDescription(`Que voulez vous faire ?\n🎫: Envoyer ce message dans le ticket que vous avez créé\n⚙️: Accéder au menu général`)
            message.channel.send({embeds: [embed]})
            .then( async mess => {
                let m = await message.channel.send(`<a:Loading:773644834031665234> Veuilez patienter avant de réagir. Réactions en cours d'ajout.`);
                await mess.react("🎫");
                await mess.react("⚙️");
                await m.delete();
                const possibleReaction = ["🎫", "⚙️", "❌"]

                mess.awaitReactions({ max: 1, filter: (reaction, user) => possibleReaction.includes(reaction.emoji.name), time: 60_000})
                    .then(collected => {
                        const reaction = collected.first();
                        switch(reaction.emoji.name){
                            case "🎫":
                                message.client.ticket[gIndex][1].send(`**${message.author.username}:** ${message.content}`);
                                message.channel.send(`:white_check_mark: Le message a été envoyé avec succès.`)
                                break;
                            case "⚙️":
                                if(message.client.general.includes(message.author.id)){
                                    message.channel.send(`:x: Vous n'avez pas la possibilité de le faire.`)
                                    break
                                }
                                ticketFirst(message);
                                break;
                        }
                    })
                    .catch( (erreur) => {
                        console.log(erreur)
                        return message.channel.send({ embeds: [error(`Le temps est imparti **OU** une erreur est survenue lors du programme contacter Sebla#1006 pour plus d'informations.`)]});
                    });
                })
            
            
            }catch(err) {
            console.log(err)
         }   
    }

});

