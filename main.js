const throttle = require('lodash/throttle');
const mcData = require('minecraft-data')('1.8.9');
const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);

const potions = require('./potions');
const weapons = require('./weapons');

require('dotenv').config();

const [host, port] = process.argv.slice(2);

const bot = mineflayer.createBot({
	host,
	username: 'dawd', //process.env.MC_USERNAME,
	// password: process.env.MC_PASSWORD,
	port,
	version: '1.8.9'
});

let state = 'waiting';
let enemy;
let hotbar;

const attack = throttle(() => {
	bot.attack(enemy);
	bot.swingArm();
}, 300);

const add = (position, { x = 0, y = 0, z = 0 }) =>
	vec3(position).add({ x, y, z });

const bestPot = () =>
	hotbar.reduce(
		(bestPot, item, index) => {
			if (item && item.type === mcData.itemsByName['potion'].id) {
				const potion = potions[item.metadata];

				if (!potion) {
					return bestPot;
				}

				const willWasteHealing = potion.healing + bot.health > 20;

				if (
					potion.splash &&
					potion.healing > bestPot.healing &&
					!willWasteHealing
				) {
					return { healing: potion.healing, index };
				}
			}

			return bestPot;
		},
		{ healing: -Infinity, index: -1 }
	);

const shouldHeal = () => bestPot().index !== -1;

const lookAt = (...args) => {
	return new Promise(resolve => {
		bot.lookAt(...args, resolve);
	});
};

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const run = async () => {
	hotbar = bot.inventory.slots.slice(-9);

	console.log(state + '');
	// react to state
	switch (state) {
		case 'waiting':
			break;
		case 'healing':
			const pot = bestPot();
			if (pot.index !== -1) {
				await lookAt(bot.entity.position, undefined);
				bot.setQuickBarSlot(pot.index);
				bot.activateItem();
			}
			break;
		case 'attacking':
			bot.lookAt(add(enemy.position, { y: enemy.height }));
			const bestWeapon = hotbar.reduce(
				(bestWeapon, item, index) => {
					if (!item) {
						return bestWeapon;
					}

					if (item.name in weapons) {
						const damage = weapons[item.name];

						return damage > bestWeapon.damage ? { index, damage } : bestWeapon;
					}

					return bestWeapon;
				},
				{ damage: -Infinity, index: -1 }
			);

			if (bestWeapon.index !== -1) {
				bot.setQuickBarSlot(bestWeapon.index);
			}

			bot.setControlState('sprint', false);
			bot.setControlState('jump', false);
			bot.setControlState(
				'forward',
				bot.entity.position.distanceTo(enemy.position) > 1.5
			);

			attack();
			break;
		case 'chasing':
			bot.lookAt(add(enemy.position, { y: enemy.height }));
			bot.setControlState('sprint', true);
			bot.setControlState('jump', true);
			bot.setControlState('forward', true);
			break;
		default:
			break;
	}

	// update state
	switch (state) {
		case 'waiting':
			if (enemy) {
				state = 'chasing';
			}
			break;
		case 'chasing':
			if (bot.entity.position.distanceTo(enemy.position) < 2.7) {
				state = 'attacking';
			}
			if (shouldHeal()) {
				state = 'healing';
			}
			break;
		case 'attacking':
			if (bot.entity.position.distanceTo(enemy.position) > 2.7) {
				state = 'chasing';
			}
			if (shouldHeal()) {
				state = 'healing';
			}
			break;
		case 'healing':
			state =
				bot.entity.position.distanceTo(enemy.position) < 2.7
					? 'attacking'
					: 'chasing';
			break;
	}

	setTimeout(run, 200);
};

run();

bot.on('entityMoved', entity => {
	if (entity.type === 'player') {
		enemy = entity;
	}
});

bot.on('health', () => {
	bot.chat(`bot hp: ${bot.health}`);
});

bot.on('error', err => console.log(err));
