const Vec3 = require('vec3');

module.exports = {
	add: (vec, { x = 0, y = 0, z = 0 }) => new Vec3(vec).add({ x, y, z }),
	subtract: (vec, { x = 0, y = 0, z = 0 }) =>
		new Vec3(vec).subtract({ x, y, z }),
	divide: (vec, n) => new Vec3({ x: vec.x / n, y: vec.y / n, z: vec.z / n })
};
