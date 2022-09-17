import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../schema/schemas";

const metadata = {
    name: "remove",
    type: "CommandInteraction",
    proctorOnly: false,
    dmCommand: false,
    builder: new SlashCommandBuilder()
        .setDescription("Remove a song from the queue")
        .addNumberOption(opt => 
            opt.setName("position")
                .setDescription("Enter the number of the position for the song you want to remove from the queue")
                .setRequired(true)
            ),
    i18n: {
        "default": {
            voiceChannelRequired: "🤔 You must be in my voice channel to remove me from it!",
            notInVoiceChannel: "🤔 I'm not in a voice channel!",
            notPlaying: "🚫 I'm not playing anything right now",
            remove: "❌ Removed **%s** from the queue",
            currentSong: "🚫 I cannot remove the current song from the queue! Use the skip command instead.",
            pastQueue: "🚫 The queue only has %s songs in it!"
        }
    }
};

async function execute(ctx, interaction) {
    await interaction.deferReply();
    if (!interaction.member?.voice?.channel && !interaction.guild?.members?.voice?.channel) {
        return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].voiceChannelRequired);
    } else {
        if (!interaction.guild?.members?.me?.voice.channel) {
            return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].notInVoiceChannel);
        };

        const player = await ctx.PoruManager.fetchPlayer(interaction.guildId, interaction.channel.id, interaction.member.voice.channel.id);
        if (!player) {
            return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].notInVoiceChannel);
        };

        const queuePos = interaction.options.getNumber("position");
        const song = player.currentTrack;

        if (!song) {
            return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].notPlaying);
        } else {
            if (queuePos > player.queue.length) return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].pastQueue.replace("%s", player.queue.length));
            if (queuePos <= 0) return await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].pastQueue.replace("%s", player.queue.length));
            const queueSong = player.queue[queuePos - 1];
            player.queue.remove(queuePos - 1);
            
            console.log(player.queue)
            await interaction.editReply(metadata.i18n[`${metadata.i18n[interaction.locale] ? interaction.locale : "default"}`].remove.replace("%s", queueSong.info?.title));
        }
    };
};

export { metadata, execute };