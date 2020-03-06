import throttle from 'lodash/throttle';
import mcData from './mcData';
// @ts-ignore
import mineflayer from 'mineflayer';
import { performance } from 'perf_hooks';
import Vec3 from 'vec3';
import util from 'util';
import dotenv from 'dotenv';

import { subtract, divide } from './utils/vec3';
import potions from './potions';
import StateId from './states/StateId';
import State from './states/State';

const states: Map<StateId, State> = Object.values(StateId).reduce(
	(states, state) => {
		const State = require(`./states/${state}`).default;

		states.set(state, new State());
		return states;
	},
	new Map()
);

dotenv.config();

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

let state: StateId = StateId.Waiting;
let prevState: StateId;

const metadata = {
	enemy: undefined,
	enemyVelocity: new Vec3(),
	hotbar: [],
	bestPotSlot: -1,
	arrowSpeed: 0.055,
	arrowGravity: 0.000018
};

const run = async () => {
	metadata.hotbar = bot.inventory.slots.slice(-9);

	if (prevState !== state) {
		bot.chat(`Bot state: ${state}`);
	}

	prevState = state;

	await states.get(state).execute(bot, metadata);

	state = states.get(state).transition(bot, metadata);

	metadata.bestPotSlot = bestPot().slot;

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
			state = StateId.Bowing;
		}
	}
});
