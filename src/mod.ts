import { CHANNEL, DISCORD_TOKEN, FORCESFW, VERSION } from "../config/config.ts";
import { ApplicationCommandInteraction, Client, Intents, slash } from '../deps.ts'
import { messages } from "./message.ts";
import { queue } from "./queue.ts";
import { fetchReference, getStatus } from "./sourcer.ts";

class boringClient extends Client {
	@slash()
	async status(d: ApplicationCommandInteraction): Promise<void> {
		const status = await getStatus();
		d.reply(`Long remaining: ${status[0]}\nShort remaining: ${status[1]}`, {ephemeral: true})
	}
}

export const baseClient: boringClient = new boringClient()
let lastMessage: string | undefined; // Workaround...

console.log(`Greetings, fellow %cLibrarian%c. Running version %cv${VERSION}`, "color: #71368A", "", "color: #ff3333")
if (!FORCESFW) console.log('%cWARNING:%c NSFW Mode is enabled. Use only for NSFW channels.', "color: red", "")

baseClient.connect(DISCORD_TOKEN, Intents.None)
	.catch(() => {
		throw new Error('Could not log in.')
	});

export const client: boringClient = await new Promise((resolve) => {
	baseClient.on('ready', () => {
		console.log('Connection established with %cDiscord%c.', "color: #5865F2", "")
		baseClient.setPresence({ type: 'WATCHING', name: 'for your sauce needs!' })

		baseClient.interactions.commands.bulkEdit([{name: "status", description: "Get quota status"}])
		resolve(baseClient);
	});
});


client.on('messageCreate', async (message) => {
	if (message.author.bot ||
		!message.channel.isGuild ||
		message.channelID !== CHANNEL.value ||
		message.content.startsWith('source') ||
		message.content.startsWith('https://www.pixiv.net') ||
		message.content.startsWith('ignore')
	) return;

	if (message.content === 'forcecheck') {
		const newMessage = await fetchReference(message)

		if (newMessage) message = newMessage
	}

	lastMessage = message.id

	if (message.attachments) {
		message.attachments.forEach(async (attachment) => {
			await queue.enqueue([attachment.url, message])
		})
	}

	if (message.embeds) {
		message.embeds.forEach(async (embed) => {
			if (!embed.thumbnail?.url) return console.log('Could not find thumbnail url');
			await queue.enqueue([embed.thumbnail?.url, message])
		})
	}
})


client.on('messageUpdate', (message, newMessage) => {
	if (message.author.bot || !message.channel.isGuild() || message.channelID !== CHANNEL.value) return;
	if (message.id !== lastMessage) return

	console.log('Working around thumbnail generation delay')

	if (newMessage.embeds) {
		const embeds = newMessage.embeds
		embeds.forEach(async embed => {
			if (!embed.thumbnail?.url) return console.log('Could not find thumbnail url');
			await queue.enqueue([embed.thumbnail?.url, message])
		})
	}

	lastMessage = undefined;
})


client.on('interactionCreate', async (interaction) => {
	if (interaction.user.bot || !interaction.isMessageComponent() || interaction.channel?.id !== CHANNEL.value) return;

	const url = interaction.customID
	const channel = interaction.channel;
	const message = await channel?.messages.fetch(interaction.message!.id)
	const origin = await fetchReference(message!)

	if (!origin) return console.log('Origin is null');

	if (origin.author.id !== interaction.user.id) {
		interaction.reply({ content: 'You do not have permission to decide for others.', ephemeral: true })
		return
	}

	console.log(`%c${interaction.user.username} %crequested a retry!`, "color: red", "")

	await queue.enqueue([url, origin])

	const button = messages.success()
	await interaction.message.edit({ components: button })
	await interaction.respond({ content: 'Done!', ephemeral: true })
})

client.on('error', (err) => {
	console.log('ERROR::: ', err)
})

client.on('gatewayError', (err) => {
	console.log('GATEWAY ERROR::: ', err)
})
