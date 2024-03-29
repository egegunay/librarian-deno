import { Message } from "../deps.ts";
import { queue } from "./queue.ts";
import { messages } from "./message.ts"

class ErrorHandler {
	private errors = 0;

	async quotaError(image: string, message: Message) {
		this.errors++
		console.log(`User %c${message.author.username} %chit the rate limit!`, "color: red")
		console.log(`Error Quota: %c${this.errors}/10`, "color: fuchsia")

		if (this.errors > 10) return await message.client.destroy()
			.then(() => {
				console.log('Goodbye...')
			}) // Too many errors, something is very wrong.

		queue.enqueue([image, message])
		return
	}

	serversideError(url: string, message: Message) {
		const button = messages.retry(url);
		message.reply(`There was an issue on website's side.`, {
			components: button,
			allowedMentions: {
				parse: []
			}
		});
		console.log(`User %c${message.author.username} %cencountered a website caused error!`, "color: red", "")
	}

	decreaseErrors() {
		if (this.errors > 0) this.errors--
	}
}

export const errorHandler = new ErrorHandler;