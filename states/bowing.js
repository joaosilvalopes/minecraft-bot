const mcData = require('minecraft-data')('1.8.9');
const Vec3 = require('vec3');
const { sleep } = require('../utils/async');
const { add } = require('../utils/vec3');

module.exports = {
	execute: async (bot, metadata) => {
		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);

		const bowIndex = metadata.hotbar.findIndex(
			item => item && item.type === mcData.itemsByName['bow'].id
		);

		if (bowIndex !== -1) {
			bot.setQuickBarSlot(bowIndex);
			bot.activateItem();
			const distance = metadata.enemy.position.distanceTo(bot.entity.position);
			const horizontalDistance = new Vec3({
				...metadata.enemy.position,
				y: 0
			}).distanceTo({ ...bot.entity.position, y: 0 });
			const { arrowSpeed, arrowGravity, enemyVelocity } = metadata;
			const travelTime = distance / arrowSpeed;

			const angle = Math.atan(
				(arrowSpeed ** 2 -
					Math.sqrt(
						arrowSpeed ** 4 -
							arrowGravity *
								(arrowGravity * horizontalDistance ** 2 +
									2 * 0 * arrowSpeed ** 2)
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
	},
	transition: (bot, metadata) => {
		const hasBow = metadata.hotbar.some(
			item => item && item.type === mcData.itemsByName['bow'].id
		);
		const hasArrows = bot.inventory.slots.some(
			item => item && item.type === mcData.itemsByName['arrow'].id
		);

		return !hasBow || !hasArrows ? 'waiting' : 'bowing';
	}
};
