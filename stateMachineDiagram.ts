import State from './states/State';
import StateId from './states/StateId';
import fs from 'fs';

let str = `
  @startuml
    [*] --> Waiting`;

Object.values(StateId).forEach(originStateId => {
	const State = require(`./states/${originStateId}`).default;
	const transitionImpl = new State().transitionImpl.toString();

	Object.values(StateId).forEach(destinyStateId => {
		if (transitionImpl.includes(destinyStateId)) {
			str += `\n    ${originStateId} --> ${destinyStateId}`;
		}
	});
});

str += `
  @enduml
`;

fs.writeFileSync('./stateDiagram.pu', str);
