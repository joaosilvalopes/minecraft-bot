import throttle from 'lodash/throttle';
// @ts-ignore
import mineflayer from 'mineflayer';
import { performance } from 'perf_hooks';
import Vec3 from 'vec3';
import dotenv from 'dotenv';

import { subtract, divide } from './utils/vec3';
import StateId from './states/StateId';
import State from './states/State';
import potions from './potions';
import mcData from './mcData';
import plug from './plugins';

const DEBUG_MODE = true;

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

plug(bot);

bot.on('error', err => console.log(err));

let state: StateId = StateId.Waiting;
let prevState: StateId;

const metadata = {
	enemy: undefined,
	enemyVelocity: new Vec3(),
	bestPotSlot: -1,
	arrowSpeed: 0.055,
	arrowGravity: 0.000018
};

const run = async () => {
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
	bot.inventory.slots.reduce(
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
let previousTime = 0;

const computeEnemyVelocity = throttle(() => {
	if (metadata.enemy) {
		const currentTime = performance.now();
		const timePassed = currentTime - previousTime;
		metadata.enemyVelocity = divide(
			subtract(metadata.enemy.position, previousEnemyPosition),
			timePassed
		);
		previousEnemyPosition = { ...metadata.enemy.position };
		previousTime = currentTime;
	}
}, 100);

bot.on('health', () => {
	bot.chat(`Bot hp: ${bot.health}`);
});

// Update enemy object reference on enemy death (needed since the reference changes on enemy death)
bot.on('entityUpdate', entity => {
	if (metadata.enemy && entity.username === metadata.enemy.username) {
		metadata.enemy = entity;
	}
});

bot.on('spawn', () => setTimeout(run, 1000));

bot.on('chat', (_, message) => {
	if (DEBUG_MODE) {
		state = StateId.Bowing;
	}
});
