import { Vec3 } from 'vec3';
import { sleep } from '../utils/async';

import State from './State';
import StateId from './StateId';
import mcData from '../mcData';

class Towering extends State {

    getBlockSlotIndex() {
        const reverseIndex = this.bot.inventory.slots.slice().reverse().findIndex((item) => item && mcData.blocksByName[item.name]);
        return reverseIndex === -1 ? -1 : 45 - reverseIndex - 1;
    }

    async moveBlocksToHand() {
        const slotIndex = this.getBlockSlotIndex();
        if (slotIndex !== -1) {
            await this.bot.fromSlotToHand(slotIndex, 8);
            return true;
        }
        return false;
    }

    async execute() {
        const { bot } = this;

        bot.lookAt(bot.entity.position);
        bot.setControlState('jump', true);

        const hasBlockInHand = await this.moveBlocksToHand();
        while (hasBlockInHand) {
            try {
                const block = bot.blockInSight();
                await bot.placeBlock(block, new Vec3(0, 1, 0));
                break;
            } catch (e) {
            }
        }
    }

    transitionImpl() {
        /*const { bot, metadata } = this;
    
        return (
            bot.entity.position.distanceTo({ ...metadata.enemy.position, y: bot.entity.position.y }) < 4 &&
            metadata.enemy.position.y - bot.entity.position.y > 2.7 &&
            this.getBlockSlotIndex() !== -1
        ) ? StateId.Towering : StateId.Chasing;*/

        return StateId.Towering;
    }

}

export default Towering;
