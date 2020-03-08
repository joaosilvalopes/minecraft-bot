import State from './State';
import StateId from './StateId';
import { add } from '../utils/vec3';
import throttle from 'lodash/throttle';
import { sleep } from '../utils/async';

const rod = throttle(async bot => {
	const rodIndex = bot.inventory.slots.findIndex(
		item => item && item.name === 'fishing_rod'
	);

	if(rodIndex === -1) return;

	const slot = bot.quickBarSlot;

	await bot.fromSlotToHand(rodIndex);
	await sleep(100);
	bot.activateItem();
	await sleep(300);
	bot.setQuickBarSlot(slot);
}, 600);

class Chasing extends State {
	async execute() {
		const { bot, metadata } = this;

		bot.lookAt(add(metadata.enemy.position, { y: metadata.enemy.height }));
		bot.setControlState('sprint', false);
		bot.setControlState('jump', true);
		bot.setControlState('forward', true);

		if (
			this.bot.entity.position.distanceTo(this.metadata.enemy.position) < 10
		) {
			rod(this.bot);
		}
	}

	transitionImpl() {
		const closeEnough =
			this.bot.entity.position.distanceTo(this.metadata.enemy.position) < 2.7;

		return closeEnough ? StateId.Attacking : StateId.Chasing;
	}
}

export default Chasing;
