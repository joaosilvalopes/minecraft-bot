import util from 'util';

const FIRST_HOTBAR_SLOT = 36;

const plug = bot => {
	bot.look = util.promisify(bot.look);
	bot.lookAt = util.promisify(bot.lookAt);
	bot.moveSlotItem = util.promisify(bot.moveSlotItem);

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
