import State from './State';
import StateId from './StateId';
import { add } from '../utils/vec3';

class Chasing extends State {
	async execute() {
		const { bot, metadata } = this;

		bot.lookAt(add(metadata.enemy.position, { y: metadata.enemy.height }));
		bot.setControlState('sprint', true);
		bot.setControlState('jump', true);
		bot.setControlState('forward', true);
	}

	transitionImpl() {
		const closeEnough =
			this.bot.entity.position.distanceTo(this.metadata.enemy.position) < 2.7;

		return closeEnough ? StateId.Attacking : StateId.Chasing;
	}
}

export default Chasing;
