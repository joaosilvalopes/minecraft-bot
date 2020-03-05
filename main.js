const throttle = require('lodash/throttle');
const mcData = require('minecraft-data')('1.8.9');
const mineflayer = require('mineflayer');
const { performance } = require('perf_hooks');
const Vec3 = require('vec3');
const util = require('util');

const { subtract, divide } = require('./utils/vec3');
const potions = require('./potions');
const states = [
	'attacking',
	'bowing',
	'chasing',
	'falling',
	'waiting',
	'healing'
].reduce(
	(states, state) => ({ ...states, [state]: require(`./states/${state}`) }),
	{}
);

require('dotenv').config();

const [host, port, name] = process.argv.slice(2);

const bot = mineflayer.createBot({
	host,
	username: name || 'bot', //process.env.MC_USERNAME,
	// password: process.env.MC_PASSWORD,
	port,
	version: '1.8.9'
});

bot.look = util.promisify(bot.look);
bot.lookAt = util.promisify(bot.lookAt);

bot.on('error', err => console.log(err));

let state = 'waiting';

const metadata = {
	enemy: undefined,
	enemyVelocity: new Vec3(),
	hotbary: [],
	bestPotSlot: -1,
	arrowSpeed: 0.038,
	arrowGravity: 0.0000056
};

let prevState;

const run = async () => {
	metadata.hotbar = bot.inventory.slots.slice(-9);

	if (prevState !== state) {
		bot.chat(`Bot state: ${state}`);
	}

	prevState = state;

	await states[state].execute(bot, metadata);

	state = states[state].transition(bot, metadata);

	metadata.bestPotSlot = bestPot().slot;

	if (metadata.bestPotSlot !== -1) {
		state = 'healing';
	}

	if (bot.entity.velocity.y === -20) {
		state = 'falling';
	}

	computeEnemyVelocity();
	setImmediate(run);
};

const bestPot = () =>
	metadata.hotbar.reduce(
		(bestPot, item, slot) => {
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
					return { healing: potion.healing, slot };
				}
			}

			return bestPot;
		},
		{ healing: -Infinity, slot: -1 }
	);

let previousEnemyPosition = new Vec3();
let before = 0;

const computeEnemyVelocity = throttle(() => {
	if (metadata.enemy) {
		const now = performance.now();
		const timePassed = now - before;
		metadata.enemyVelocity = divide(
			subtract(metadata.enemy.position, previousEnemyPosition),
			timePassed
		);
		previousEnemyPosition = { ...metadata.enemy.position };
		before = now;
	}
}, 100);

bot.on('health', () => {
	bot.chat(`Bot hp: ${bot.health}`);
});

bot.on('entityUpdate', entity => {
	if (metadata.enemy && entity.username === metadata.enemy.username) {
		metadata.enemy = entity;
	}
});

bot.on('spawn', () => setTimeout(run, 1000));

bot.on('chat', (_, message) => {
	if (message === 'bow' && metadata.hotbar) {
		const hasBow = metadata.hotbar.some(
			item => item && item.type === mcData.itemsByName['bow'].id
		);
		const hasArrows = bot.inventory.slots.some(
			item => item && item.type === mcData.itemsByName['arrow'].id
		);

		if (hasBow && hasArrows) {
			state = 'bowing';
		}
	}
});
