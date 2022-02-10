const { error } = require("./useful");

const mute = async  ( message, member ) => {
    let role = message.guild.roles.cache.find(role => role.name === "Muted");
       try{
            if(!role){
                role = await message.guild.roles.create({
                    name: "Muted",
                    color: "GREY",
                    permissions: 1024n
                });
            }else if(role.permissions.bitfield !== 1024){
                 role = await role.setPermissions(1024n);
            }
       }catch(e){
           console.log(e)
            return message.channel.send({ embeds: [error("Impossible de **créer** le rôle Muted ou de **modifier** les permissions du rôle Muted, sûrement un manque de permission.")]});
       }

       member.roles.add(role)
       .then( () => {
            return message.channel.send({ embeds: [error(`${member} a été mute. Le rôle qui lui a été ajouté est ${role}`, true)]});
       })
       .catch( (err) => {
           console.log(err)
            return message.channel.send({ embeds: [error(`Impossible d'ajouter le rôle ${role} à ${member}, sûrement un manque de permission.`)]});
       });
}

const unmute = async ( message, member ) => {
    const role = message.guild.roles.cache.find(role => role.name === "Muted")
    member.roles.remove(role)
    .then( () => {
        return message.channel.send({ embeds: [error(`${member} a été unmute avec succès.`, true)]});
   })
   .catch( (err) => {
       console.log(err)
        return message.channel.send({ embeds: [error(`Impossible de retirer le rôle ${role} à ${member}, sûrement un manque de permission.`)]});
   });
}

module.exports = {
    mute,
    unmute
}