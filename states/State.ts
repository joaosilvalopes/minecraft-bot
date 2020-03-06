import StateId from './StateId';

abstract class State {
	bot;
	metadata;

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

		return this.transitionImpl();
	}
}

export default State;
