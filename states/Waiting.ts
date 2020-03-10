import State from './State';
import StateId from './StateId';
import mcData from '../mcData';

const searchEnemy = bot =>
	Object.values(bot.entities).reduce((enemy: any, entity: any) => {
		const isEnemy =
			entity &&
			entity.type === 'player' &&
			entity.username !== bot.entity.username;

		const isClosest =
			!enemy ||
			entity.position.distanceTo(bot.entity.position) <
				enemy.position.distanceTo(bot.entity.position);

		return isEnemy && isClosest ? entity : enemy;
	}, undefined);

class Waiting extends State {
	async execute() {
		const { bot, metadata } = this;

		metadata.enemy = searchEnemy(bot);
	}

	transitionImpl() {
		const { bot, metadata } = this;

		if (metadata.enemy) {
			const hasBow = bot.inventory.slots.some(
				item => item && item.type === mcData.itemsByName['bow'].id
			);
			const hasArrows = bot.inventory.slots.some(
				item => item && item.type === mcData.itemsByName['arrow'].id
			);

			return hasBow && hasArrows ? StateId.Bowing : StateId.Chasing;
		}

		return StateId.Waiting;
	}
}

export default Waiting;
