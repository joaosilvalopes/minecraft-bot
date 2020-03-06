import State from './State';
import StateId from './StateId';
import mcData from '../mcData';
import { subtract } from '../utils/vec3';
import { sleep } from '../utils/async';

class Falling extends State {
	async execute() {
		const { bot } = this;
		const block = bot.blockAt(subtract(bot.entity.position, { y: 3 }));

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);

		if (block && block.name !== 'air') {
			await bot.look(0, -Math.PI / 2, true);

			const bucketIndex = bot.inventory.slots.findIndex(
				item => item && item.type === mcData.itemsByName['water_bucket'].id
			);

			if (bucketIndex !== -1) {
				await bot.fromSlotToHand(bucketIndex);
			}

			bot.activateItem();
			await sleep(350);
			bot.activateItem();
		}
	}

	transitionImpl() {
		return this.bot.entity.velocity.y === 0 ? StateId.Waiting : StateId.Falling;
	}
}

export default Falling;
