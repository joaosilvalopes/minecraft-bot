import throttle from 'lodash/throttle';
// @ts-ignore
import mineflayer from 'mineflayer';
import armorManager from 'mineflayer-armor-manager';
import { performance } from 'perf_hooks';
import { Vec3 } from 'vec3';
import dotenv from 'dotenv';

import { minus, divide } from './utils/vec3';
import StateId from './states/StateId';
import State from './states/State';
import potions from './potions';
import mcData from './mcData';
import plug from './plugins';

const DEBUG_MODE = true;

dotenv.config();

const [
	host = process.env.HOST || 'localhost',
	port = process.env.PORT || 25565,
	username = process.env.MC_USERNAME || 'NoComp_Fury'
] = process.argv.slice(2);

const bot = mineflayer.createBot({
	host,
	username,
	//password: process.env.MC_PASSWORD,
	port,
	version: '1.8.9'
});

plug(bot);
armorManager(bot, {
	version: '1.8.9'
});

const metadata = {
	enemy: undefined,
	enemyVelocity: new Vec3(0, 0, 0),
	bestPotSlot: -1,
	arrowSpeed: 0.055,
	arrowGravity: 0.000018
};

const states: Map<StateId, State> = Object.values(StateId).reduce(
	(states, stateId) => {
		const State = require(`./states/${stateId}`).default;

		states.set(stateId, new State(bot, metadata));
		return states;
	},
	new Map()
);

let stateId = StateId.Waiting;
let prevStateId: StateId;

const chat = throttle(message => {
	bot.chat(message);
}, 1000);

const run = async () => {
	if (prevStateId !== stateId) {
		chat(`Bot state: ${stateId}`);
	}

	prevStateId = stateId;

	const state = states.get(stateId);

	bot.clearControlStates();
	await state.execute();

	stateId = state.transition();

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

let previousEnemyPosition = {};
let previousTime = 0;

const computeEnemyVelocity = throttle(() => {
	if (metadata.enemy) {
		const currentTime = performance.now();
		const timePassed = currentTime - previousTime;
		metadata.enemyVelocity = divide(
			minus(metadata.enemy.position, previousEnemyPosition),
			timePassed
		);
		previousEnemyPosition = { ...metadata.enemy.position };
		previousTime = currentTime;
	}
}, 100);

bot.on('health', () => {
	chat(`Bot hp: ${bot.health}`);
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
		stateId = states.has(message) ? message : stateId;
	}
});

bot.on('error', err => console.log(err));
