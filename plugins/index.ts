import util from 'util';

const FIRST_HOTBAR_SLOT = 36;

const promisifiedMethods = [
	'look',
	'lookAt',
	'moveSlotItem',
	'placeBlock',
	'consume'
];

const plug = bot => {
	for (const method of promisifiedMethods) {
		bot[method] = util.promisify(bot[method]);
	}

	bot.fromSlotToHand = async (slot: number) => {
		if (slot < FIRST_HOTBAR_SLOT) {
			await bot.moveSlotItem(slot, FIRST_HOTBAR_SLOT);
			bot.setQuickBarSlot(0);
		} else {
			bot.setQuickBarSlot(slot - FIRST_HOTBAR_SLOT);
		}
	};
};

export default plug;
