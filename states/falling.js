const mcData = require('minecraft-data')('1.8.9');
const { subtract } = require('../utils/vec3');
const { sleep } = require('../utils/async');

module.exports = {
	execute: async (bot, metadata) => {
		const block = bot.blockAt(subtract(bot.entity.position, { y: 3 }));

		bot.setControlState('sprint', false);
		bot.setControlState('jump', false);
		bot.setControlState('forward', false);
		if (block && block.name !== 'air') {
			await bot.look(0, -Math.PI / 2, true);
			const bucketIndex = metadata.hotbar.findIndex(
				item => item && item.type === mcData.itemsByName['water_bucket'].id
			);
			bucketIndex !== -1 && bot.setQuickBarSlot(bucketIndex);
			await bot.activateItem();
			await sleep(350);
			await bot.activateItem();
		}
	},
	transition: (bot, metadata) =>
		bot.entity.velocity.y === 0 ? 'waiting' : 'falling'
};
