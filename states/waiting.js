const mcData = require('minecraft-data')('1.8.9');

const searchEnemy = bot =>
	Object.values(bot.entities).reduce((enemy, entity) => {
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

module.exports = {
	execute: async (bot, metadata) => {
		metadata.enemy = searchEnemy(bot);
		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);
	},
	transition: (bot, metadata) => {
		if (metadata.enemy) {
			const hasBow = metadata.hotbar.some(
				item => item && item.type === mcData.itemsByName['bow'].id
			);
			const hasArrows = bot.inventory.slots.some(
				item => item && item.type === mcData.itemsByName['arrow'].id
			);

			return hasBow && hasArrows ? 'bowing' : 'chasing';
		}

		return 'waiting';
	}
};
