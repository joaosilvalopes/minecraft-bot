import throttle from 'lodash/throttle';
import State from './State';
import { add } from '../utils/vec3';
import weapons from '../weapons';
import StateId from './StateId';

const attack = throttle((bot, enemy) => {
	bot.attack(enemy);
	bot.swingArm();
}, 300);

class Attacking extends State {
	async execute() {
		const { bot, metadata } = this;

		bot.lookAt(add(metadata.enemy.position, { y: metadata.enemy.height }));
		const bestWeapon = bot.inventory.slots.reduce(
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
			await bot.fromSlotToHand(bestWeapon.index);
		}

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState(
			'forward',
			bot.entity.position.distanceTo(metadata.enemy.position) > 2
		);

		attack(bot, metadata.enemy);
	}

	transitionImpl() {
		const farEnough =
			this.bot.entity.position.distanceTo(this.metadata.enemy.position) > 2.7;

		return farEnough ? StateId.Chasing : StateId.Attacking;
	}
}

export default Attacking;
