import State from './State';
import { sleep } from '../utils/async';
import StateId from './StateId';

class Healing extends State {
	async execute() {
		const { bot, metadata } = this;

		if (metadata.bestPotSlot !== -1) {
			await bot.look(
				bot.entity.yaw < 0
					? bot.entity.yaw + Math.PI
					: bot.entity.yaw - Math.PI,
				-Math.PI / 2,
				true
			);
			bot.setControlState('forward', true);
			bot.setControlState('sprint', true);
			bot.setControlState('jump', true);
			await sleep(1000);
			await bot.fromSlotToHand(metadata.bestPotSlot);
			bot.activateItem();
			await sleep(300);
		}
	}

	transitionImpl() {
		return StateId.Waiting;
	}
}

export default Healing;
