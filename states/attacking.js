const throttle = require('lodash/throttle');
const { add } = require('../utils/vec3');
const weapons = require('../weapons');

const attack = throttle((bot, enemy) => {
	bot.attack(enemy);
	bot.swingArm();
}, 300);

module.exports = {
	execute: async (bot, metadata) => {
		bot.lookAt(add(metadata.enemy.position, { y: metadata.enemy.height }));
		const bestWeapon = metadata.hotbar.reduce(
			(bestWeapon, item, index) => {
				if (!item) {
					return bestWeapon;
				}

				if (item.name in weapons) {
					const damage = weapons[item.name];

					return damage > bestWeapon.damage ? { index, damage } : bestWeapon;
				}

				return bestWeapon;
			},
			{ damage: -Infinity, index: -1 }
		);

		if (bestWeapon.index !== -1) {
			bot.setQuickBarSlot(bestWeapon.index);
		}

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState(
			'forward',
			bot.entity.position.distanceTo(metadata.enemy.position) > 2
		);

		attack(bot, metadata.enemy);
	},
	transition: (bot, metadata) => {
		const farEnough =
			bot.entity.position.distanceTo(metadata.enemy.position) > 2.7;

		return farEnough ? 'chasing' : 'attacking';
	}
};
