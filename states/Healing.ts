import State from './State';
import { sleep } from '../utils/async';
import StateId from './StateId';

class Healing extends State {
	async execute(bot, metadata) {
		if (metadata.bestPotSlot !== -1) {
			await bot.lookAt(bot.entity.position, true);
			bot.setQuickBarSlot(metadata.bestPotSlot);
			bot.activateItem();
			await sleep(300);
		}
	}

	transitionImpl(bot, metadata) {
		return StateId.Waiting;
	}
}

export default Healing;
