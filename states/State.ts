import StateId from './StateId';

abstract class State {
	abstract async execute(bot, metadata): Promise<any>;

	abstract transitionImpl(bot, metadata): StateId;

	transition(bot, metadata): StateId {
		if (bot.entity.velocity.y === -20) {
			return StateId.Falling;
		}

		if (metadata.bestPotSlot !== -1) {
			return StateId.Healing;
		}

		return this.transitionImpl(bot, metadata);
	}
}

export default State;
