import { url } from "../config/config.ts";
import { Embed, Message } from "../deps.ts";
import { errorHandler } from "./handleerror.ts";
import { messages } from "./message.ts";

export type SauceInfo = {
	url: string;
	source: string;
	title: string;
	material: string;
	characters: string;
	name: string;
	hidden: boolean;
	indexId: string;
	dupes: string;
	similarity: string;
	thumbnail: string
}

class Sourcer {
	async fetchData(artwork: string) {
		const response = await fetch(url + artwork);
		const data = await response.json()

		return data
	}

	async parseSource(artwork: string) { // This code is ugly. Blame website.
		const data = await this.fetchData(artwork);
		const header = await data['header'];

		if (header == -2) return "QUOTA_DEPLETED"
		if (header.status == -3) return "TIMEOUT"
		if (header.status > 0) return "SERVER_ERROR"

		const results: SauceInfo[] = [];

		for (let index = 0; index < data['results'].length; index++) {
			const info = data['results'][index]['header'];
			const indexData = data['results'][index]['data'];
			const url = indexData['ext_urls'] // This is here because I need to check it.

			if (header && url) {
				const sauce: SauceInfo = {
					url: url,
					source: indexData['source'],
					title: indexData['title'],
					material: indexData['material'],
					characters: indexData['characters'],
					name: info['index_name'],
					hidden: info['hidden'],
					indexId: info['index_id'],
					dupes: info['dupes'],
					similarity: info['similarity'],
					thumbnail: info['thumbnail'],
				}
				results.push(sauce)
			}
		}

		return results
	}

	async sendSource(image: string, message: Message) {
		console.log(`Processing image: %c${image}`, "color: green");

		await this.parseSource(image).then(async sourceInfo => {
			if (sourceInfo == 'QUOTA_DEPLETED') return errorHandler.quotaError(image, message);
			if (sourceInfo == 'TIMEOUT') return errorHandler.quotaError(image, message);
			if (sourceInfo == 'SERVER_ERROR') return errorHandler.serversideError(image, message)

			const response: Embed[] = [];

			sourceInfo.forEach(async (e) => {
				response.push(await messages.sourceMessage(e))
			});

			const buttons = await messages.buttons(image);

			message.reply({
				embeds: response,
				components: buttons,
				allowedMentions: {
					parse: []
				}
			}).then(() => {
				console.log(`Sauce sent to user %c${message.author.username}\n`, "color: red")
				errorHandler.decreaseErrors()
			});
		})
		return true;
	}
}

export async function fetchReference(message: Message) {
	if (!message.messageReference) return message.reply('No reference!', { allowedMentions: { parse: [] } });
	const requestedId = message.messageReference.message_id
	if (!requestedId) {
		console.log('No reference to fetch.')
		return null;
	}

	await message.channel.messages
		.fetch(requestedId)
		.then(fetchedMessage => { message = fetchedMessage })
		.catch(console.error)

	return message
}

export async function getStatus() {
	const response = await fetch(url);
	const data = await response.json()
	const long = data['header']['long_remaining']
	const short = data['header']['short_remaining']
	return [long, short]
}

export const sourcer = new Sourcer;