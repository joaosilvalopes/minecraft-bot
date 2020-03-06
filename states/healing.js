const { sleep } = require('../utils/async');

module.exports = {
	execute: async (bot, metadata) => {
		if (metadata.bestPotSlot !== -1) {
			await bot.lookAt(bot.entity.position, true);
			bot.setQuickBarSlot(metadata.bestPotSlot);
			bot.activateItem();
			await sleep(300);
		}
	},
	transition: () => 'waiting'
};
