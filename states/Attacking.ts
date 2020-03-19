import throttle from 'lodash/throttle';
import State from './State';
import { plus } from '../utils/vec3';
import weapons from '../weapons';
import StateId from './StateId';
import mcData from '../mcData';

const SHARPNESS_ID = mcData.enchantmentsByName["sharpness"].id;
const SHARPNESS_DMG_MOD = 1.25;

const attack = throttle((bot, enemy) => {
	bot.attack(enemy);
	bot.swingArm();
}, 350);

const strafe = throttle(bot => {
	const [previousDir, dir] =
		Math.random() > 0.5 ? ['left', 'right'] : ['right', 'left'];

	bot.setControlState(dir, true);
	bot.setControlState(previousDir, false);
}, 500);

class Attacking extends State {
	async execute() {
		const { bot, metadata } = this;

		bot.lookAt(plus(metadata.enemy.position, { y: metadata.enemy.height }));
		const bestWeapon = bot.inventory.slots.reduce(
			(bestWeapon, item, index) => {
				if (!item) {
					return bestWeapon;
				}

				const sharpnessEnchantment = item.nbt?.value.ench.value.value.find((enchantment) => enchantment.id.value === SHARPNESS_ID);
				const sharpnessDamage = sharpnessEnchantment ? sharpnessEnchantment.lvl.value * SHARPNESS_DMG_MOD : 0;

				if (item.name in weapons) {
					const damage = weapons[item.name] + sharpnessDamage;
					return damage > bestWeapon.damage ? { index, damage } : bestWeapon;
				}

				return bestWeapon;
			},
			{ damage: -Infinity, index: -1 }
		);

		if (bestWeapon.index !== -1) {
			await bot.fromSlotToHand(bestWeapon.index);
		}

		bestWeapon.index !== -1 && bot.activateItem(); // block hitting
		bot.setControlState(
			'forward',
			bot.entity.position.distanceTo(metadata.enemy.position) > 2
		);

		strafe(bot);
		attack(bot, metadata.enemy);
	}

	transitionImpl() {
		const farEnough =
			this.bot.entity.position.distanceTo(this.metadata.enemy.position) > 2.7;

		return farEnough ? StateId.Chasing : StateId.Attacking;
	}

	throttled = [attack, strafe];
}

export default Attacking;
