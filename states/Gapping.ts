import State from './State';
import { sleep } from '../utils/async';
import StateId from './StateId';

class Gapping extends State {
	eating = true;

	init() {
		setTimeout(() => (this.eating = false), 1800);
	}

	async execute() {
		const { bot, metadata } = this;

		if (metadata.gapSlot !== -1) {
			await bot.fromSlotToHand(metadata.gapSlot);
			bot.activateItem();
		}
	}

	transitionImpl() {
		return this.eating ? StateId.Gapping : StateId.Waiting;
	}
}

export default Gapping;
