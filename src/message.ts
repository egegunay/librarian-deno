import { Embed, MessageComponents } from "../deps.ts";
import { NSFW_IMAGE, FORCESFW } from "../config/config.ts"
import { SauceInfo } from "./sourcer.ts";

class Messages {
	async sourceMessage(si: SauceInfo) {
		const validTitle = si.title ? si.title : si.name

		const embed = await new Embed()
			.setTimestamp(Date.now())
			.setURL(si.url[0])
			.setTitle(`${validTitle}`)
			.addFields(
				// { name: 'hidden:', value: `${Boolean(si.hidden)}`, inline: true },
				// { name: 'index_id:', value: `${si.indexId}`, inline: true },
				// { name: 'dupes:', value: `${si.dupes}`, inline: true },
				{ name: 'similarity:', value: `${si.similarity}%`, inline: true }
			)

		// todo, if si.url[0]'s are same, it will get in the same embed

		if (si.similarity.split(',')[0] > '85') {
			embed.setColor('#4f0099')
		} else if (FORCESFW && si.hidden) {
			embed.setImage(`${NSFW_IMAGE}`)
			embed.setColor('#bf0000')
		} else {
			embed.setImage(si.thumbnail)
			embed.setColor('#69faff')
		}

		if (si.material) {
			const link = si.material.replaceAll(' ', '%20')
			embed.addField("material:", `[${si.material}](https://www.google.com/search?q=${link}&safe=off)`, true)
		}

		if (si.characters) {
			const link = si.characters.replaceAll(' ', '%20')
			embed.addField("characters:", `[${si.characters}](https://www.google.com/search?q=${link}&safe=off)`, true)
		}

		return embed
	}

	buttons(url: string) {
		const buttons = new MessageComponents({
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				style: "LINK",
				label: "Yandex",
				url: `https://yandex.com/images/search?rpt=imageview&url=${url}`,
				emoji: {
					name: '🔍'
				}
			}, {
				type: "BUTTON",
				style: "LINK",
				label: "ImgOps",
				url: `https://imgops.com/${url}`,
				emoji: {
					name: '🔍'
				}
			}, {
				type: "BUTTON",
				style: "LINK",
				label: "IQDB",
				url: `https://iqdb.org/?url=${url}`,
				emoji: {
					name: '🔍'
				}
			}]
		})

		return buttons
	}

	retry(url: string) {
		const retry = new MessageComponents({
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				style: "PRIMARY",
				label: "Retry",
				customID: url
			}]
		})

		return retry
	}

	success() {
		const success = new MessageComponents({
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				style: "SUCCESS",
				label: "Done",
				customID: 'null',
				disabled: true
			}]
		})

		return success
	}
}

export const messages = new Messages;