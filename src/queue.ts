import { Message } from '../deps.ts'
import { sourcer } from './sourcer.ts'

class Queue {
	private quota = 4;
	private queue: [string, Message][] = [];

	async enqueue(arr: [string, Message]) {
		this.queue?.push(arr);
		return await this.handleQuota()
	}

	private async handleQuota() {
		if (this.quota == 0) return console.log('We ran out of quota.');
		const currentSauce = this.dequeue();
		if (!currentSauce) return;

		this.quota--

		setTimeout(() => { this.addQuota() }, 30500)
		return await sourcer.sendSource(currentSauce[0], currentSauce[1])
	}

	private addQuota() {
		this.quota++
		this.handleQuota()
	}

	private dequeue() {
		return this.queue?.shift()
	}
}

export const queue = new Queue;