import util from 'util';
import armorManager from 'mineflayer-armor-manager';
import mineflayer from 'mineflayer';

const navigatePlugin = require('mineflayer-navigate')(mineflayer);

const FIRST_HOTBAR_SLOT = 36;

const promisifiedMethods = [
	'look',
	'lookAt',
	'moveSlotItem',
	'placeBlock',
	'consume'
];

const externalPlugins = [
	(bot) => armorManager(bot, { version: '1.8.9' }),
	navigatePlugin
];

const plug = bot => {
	for (const method of promisifiedMethods) {
		bot[method] = util.promisify(bot[method]);
	}

	bot.fromSlotToHand = async (slot: number, handSlot = 0) => {
		if (slot < FIRST_HOTBAR_SLOT) {
			await bot.moveSlotItem(slot, FIRST_HOTBAR_SLOT + handSlot);
			bot.setQuickBarSlot(handSlot);
		} else {
			bot.setQuickBarSlot(slot - FIRST_HOTBAR_SLOT);
		}
	};

	externalPlugins.forEach(plugin => plugin(bot));
};

export default plug;
