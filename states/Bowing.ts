import Vec3 from 'vec3';
import State from './State';
import StateId from './StateId';
import mcData from '../mcData';
import { add } from '../utils/vec3';
import { sleep } from '../utils/async';

class Bowing extends State {
	async execute() {
		const { bot, metadata } = this;

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);

		const bowIndex = bot.inventory.slots.findIndex(
			item => item && item.type === mcData.itemsByName['bow'].id
		);

		if (bowIndex !== -1) {
			await bot.fromSlotToHand(bowIndex);
			bot.activateItem();
			const distance = metadata.enemy.position.distanceTo(bot.entity.position);
			const horizontalDistance = new Vec3({
				...metadata.enemy.position,
				y: 0
			}).distanceTo({ ...bot.entity.position, y: 0 });
			const verticalDistance =
				Math.abs(metadata.enemy.position.y - bot.entity.position.y) - 1;
			const { arrowSpeed, arrowGravity, enemyVelocity } = metadata;
			const travelTime = distance / arrowSpeed;
			const angle = Math.atan(
				(arrowSpeed ** 2 -
					Math.sqrt(
						arrowSpeed ** 4 -
							arrowGravity *
								(arrowGravity * horizontalDistance ** 2 +
									2 * verticalDistance * arrowSpeed ** 2)
					)) /
					(arrowGravity * horizontalDistance)
			);
			await sleep(1100);
			await bot.lookAt(
				add(metadata.enemy.position, {
					x: enemyVelocity.x * travelTime,
					z: enemyVelocity.z * travelTime,
					y: enemyVelocity.y * travelTime + metadata.enemy.height
				}),
				true
			);
			await bot.look(bot.entity.yaw, angle, true);
			bot.deactivateItem();
			const strafeDir = Math.random() > 0.5 ? 'left' : 'right';
			bot.setControlState('jump', true);
			bot.setControlState(strafeDir, true);
			await sleep(200);
			bot.setControlState(strafeDir, false);
		}
	}

	transitionImpl() {
		const { bot } = this;

		const hasBow = bot.inventory.slots.some(
			item => item && item.type === mcData.itemsByName['bow'].id
		);
		const hasArrows = bot.inventory.slots.some(
			item => item && item.type === mcData.itemsByName['arrow'].id
		);

		return !hasBow || !hasArrows ? StateId.Waiting : StateId.Bowing;
	}
}

export default Bowing;
