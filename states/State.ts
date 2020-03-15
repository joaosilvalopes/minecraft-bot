import StateId from './StateId';
import { Cancelable } from 'lodash';

abstract class State {
	bot;
	metadata;
	throttled: Cancelable[] = [];

	constructor(bot, metadata) {
		this.bot = bot;
		this.metadata = metadata;
	}

	abstract async execute(): Promise<any>;

	abstract transitionImpl(): StateId;

	transition(): StateId {
		if (this.bot.entity.velocity.y === -20) {
			return StateId.Falling;
		}

		if (this.metadata.bestPotSlot !== -1) {
			return StateId.Healing;
		}

		if (this.metadata.gapSlot !== -1) {
			return StateId.Gapping;
		}

		return this.transitionImpl();
	}

	init(): void {}
}

export default State;
