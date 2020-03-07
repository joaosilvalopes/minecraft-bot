import Vec3 from 'vec3';

export const add = (vec: Vec3, { x = 0, y = 0, z = 0 }) =>
	new Vec3(vec).add({ x, y, z });

export const subtract = (vec: Vec3, { x = 0, y = 0, z = 0 }) =>
	new Vec3(vec).subtract({ x, y, z });

export const divide = (vec: Vec3, n: number) =>
	new Vec3({ x: vec.x / n, y: vec.y / n, z: vec.z / n });
