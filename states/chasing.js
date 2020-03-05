const { add } = require('../utils/vec3');

module.exports = {
	execute: async (bot, metadata) => {
		bot.lookAt(add(metadata.enemy.position, { y: metadata.enemy.height }));
		bot.setControlState('sprint', true);
		bot.setControlState('jump', true);
		bot.setControlState('forward', true);
	},
	transition: (bot, metadata) => {
		const closeEnough =
			bot.entity.position.distanceTo(metadata.enemy.position) < 2.7;

		return closeEnough ? 'attacking' : 'chasing';
	}
};
