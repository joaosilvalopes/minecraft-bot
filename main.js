const throttle = require('lodash/throttle');
const mcData = require('minecraft-data')('1.8.9');
const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);

require('dotenv').config();

const [host, port] = process.argv.slice(2);

const bot = mineflayer.createBot({
	host,
	username: process.env.MC_USERNAME,
	password: process.env.MC_PASSWORD,
	port,
	version: '1.8.9'
});

navigatePlugin(bot);

const state = {
	healing: false,
	enemy: null
};

const attack = throttle(() => {
	bot.attack(state.enemy);
	bot.swingArm();
}, 250);

const add = (position, { x = 0, y = 0, z = 0 }) =>
	vec3(position).add({ x, y, z });

bot.on('entityMoved', entity => {
	if (entity.type === 'player') {
		state.enemy = entity;

		if (state.healing) {
			return;
		}

		bot.lookAt(add(state.enemy.position, { y: state.enemy.height }));
		bot.setControlState(
			'forward',
			bot.entity.position.distanceTo(state.enemy.position) >= 2.7
		);

		if (bot.entity.position.distanceTo(state.enemy.position) < 2.7) {
			const hotbar = bot.inventory.slots.slice(-9);
			const weaponIndex = hotbar.findIndex(
				item => item && item.type === mcData.itemsByName['wooden_axe'].id
			);

			if (weaponIndex !== -1) {
				bot.setQuickBarSlot(weaponIndex);
			}

			attack();
		}
	}
});

bot.on('health', () => {
	if (bot.health < 15) {
		const hotbar = bot.inventory.slots.slice(-9);
		const potIndex = hotbar.findIndex(
			item => item && item.type === mcData.itemsByName['potion'].id
		);
		if (potIndex !== -1) {
			state.healing = true;
			bot.lookAt(bot.entity.position, undefined, () => {
				bot.setQuickBarSlot(potIndex);
				bot.activateItem();
				setTimeout(() => (state.healing = false), 100);
			});
		}
	}
});

bot.on('error', err => console.log(err));
