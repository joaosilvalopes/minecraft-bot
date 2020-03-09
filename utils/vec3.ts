import { Vec3 } from 'vec3';

export const plus = (vec: Vec3, { x = 0, y = 0, z = 0 }) =>
	vec.plus(new Vec3(x, y, z));

export const minus = (vec: Vec3, { x = 0, y = 0, z = 0 }) =>
	vec.minus(new Vec3(x, y, z));

export const divide = (vec, n: number) =>
	new Vec3(vec.x / n, vec.y / n, vec.z / n);
