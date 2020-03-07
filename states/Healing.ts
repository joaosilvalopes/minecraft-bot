import State from './State';
import { sleep } from '../utils/async';
import StateId from './StateId';

class Healing extends State {
	async execute() {
		const { bot, metadata } = this;

		if (metadata.bestPotSlot !== -1) {
			await bot.fromSlotToHand(metadata.bestPotSlot);
			await bot.lookAt(bot.entity.position, true);
			bot.activateItem();
			await sleep(300);
		}
	}

	transitionImpl() {
		return StateId.Waiting;
	}
}

export default Healing;
