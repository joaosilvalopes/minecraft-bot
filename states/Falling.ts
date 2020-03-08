import State from './State';
import StateId from './StateId';
import mcData from '../mcData';
import Vec3 from 'vec3';
import { sleep } from '../utils/async';

class Falling extends State {
	async execute() {
		const { bot } = this;

		await bot.look(0, -Math.PI / 2, true);
		const block = bot.blockInSight();

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);

		if (
			block &&
			block.name !== 'air' &&
			bot.entity.position.distanceTo(block.position) < 3
		) {
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
