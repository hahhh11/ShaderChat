import { Uniforms } from "./types";

export const getUniformType = (fsSource: string, uniformName: string): "float" | "vec3" | "vec4" | "sampler2D" => {
	const floatRegex = new RegExp(`uniform\\s+float\\s+${uniformName};`);
	const vec3Regex = new RegExp(`uniform\\s+vec3\\s+${uniformName};`);
	const vec4Regex = new RegExp(`uniform\\s+vec4\\s+${uniformName};`);
	const sampler2DRegex = new RegExp(`uniform\\s+sampler2D\\s+${uniformName};`);

	if (floatRegex.test(fsSource)) return "float";
	if (vec3Regex.test(fsSource)) return "vec3";
	if (vec4Regex.test(fsSource)) return "vec4";
	if (sampler2DRegex.test(fsSource)) return "sampler2D";
	return "float"; // 默认返回float
};

export const discoverUniformNames = (fsSource: string): string[] => {
	const floatRegex = /uniform\s+float\s+([a-zA-Z_]\w*);/g;
	const vec3Regex = /uniform\s+vec3\s+([a-zA-Z_]\w*);/g;
	const vec4Regex = /uniform\s+vec4\s+([a-zA-Z_]\w*);/g;
	const sampler2DRegex = /uniform\s+sampler2D\s+([a-zA-Z_]\w*);/g;
	let match;
	const names = new Set<string>();
	const excluded = ["iTime", "iResolution", "projectionMatrix", "modelViewMatrix", "viewMatrix", "normalMatrix", "cameraPosition"];

	// 检测float uniforms
	while ((match = floatRegex.exec(fsSource)) !== null) {
		const name = match[1];
		if (!excluded.includes(name)) {
			names.add(name);
		}
	}

	// 检测vec3 uniforms
	while ((match = vec3Regex.exec(fsSource)) !== null) {
		const name = match[1];
		if (!excluded.includes(name)) {
			names.add(name);
		}
	}

	// 检测vec4 uniforms
	while ((match = vec4Regex.exec(fsSource)) !== null) {
		const name = match[1];
		if (!excluded.includes(name)) {
			names.add(name);
		}
	}

	// 检测sampler2D uniforms
	while ((match = sampler2DRegex.exec(fsSource)) !== null) {
		const name = match[1];
		if (!excluded.includes(name)) {
			names.add(name);
		}
	}

	return Array.from(names);
};

export const setupUniforms = (
	uniformNames: string[],
	customUniforms: Uniforms,
	setCustomUniforms: (uniforms: Uniforms) => void,
	uniforms: Uniforms,
	setUniforms: (uniforms: Uniforms) => void,
	fragmentShader?: string
): void => {
	const newCustomUniforms = { ...customUniforms };
	let hasChanges = false;

	// 添加或初始化新的Uniforms，但保留同名uniform的现有值
	uniformNames.forEach((name) => {
		if (!(name in newCustomUniforms)) {
			// 根据uniform类型设置默认值
			if (fragmentShader) {
				const uniformType = getUniformType(fragmentShader, name);
				if (uniformType === "vec3") {
					// vec3 uniform 默认值为白色 (1, 1, 1)
					newCustomUniforms[name] = {
						value: { r: 1, g: 1, b: 1 },
						type: "vec3",
					};
				} else if (uniformType === "vec4") {
					// vec4 uniform 默认值为白色 (1, 1, 1, 1)
					newCustomUniforms[name] = {
						value: { r: 1, g: 1, b: 1, a: 1 },
						type: "vec4",
					};
				} else if (uniformType === "sampler2D") {
					// sampler2D uniform 默认值为null
					newCustomUniforms[name] = {
						value: null,
						type: "sampler2D",
					};
				} else {
					// float uniform 默认值为0.5
					newCustomUniforms[name] = { value: 0.5 };
				}
			} else {
				// 如果没有fragmentShader，默认为float
				newCustomUniforms[name] = { value: 0.5 };
			}
			hasChanges = true;
		}
		// 如果uniform已存在，保留现有的值和类型，但确保类型信息正确
		else if (fragmentShader) {
			const uniformType = getUniformType(fragmentShader, name);
			const currentUniform = newCustomUniforms[name];

			// 只有当类型信息缺失或不正确时才更新
			if (!currentUniform.type || currentUniform.type !== uniformType) {
				// 如果类型相同或值兼容，保留现有值，只更新类型信息
				if (areUniformValuesCompatible(currentUniform.value, uniformType)) {
					newCustomUniforms[name] = {
						...currentUniform,
						type: uniformType,
					};
				} else {
					// 如果类型不兼容，需要重新初始化值
					if (uniformType === "vec3") {
						newCustomUniforms[name] = {
							value: { r: 1, g: 1, b: 1 },
							type: "vec3",
						};
					} else if (uniformType === "vec4") {
						newCustomUniforms[name] = {
							value: { r: 1, g: 1, b: 1, a: 1 },
							type: "vec4",
						};
					} else if (uniformType === "sampler2D") {
						// 对于sampler2D类型，如果当前值已经是图片，保留它
						if (
							currentUniform.value instanceof HTMLImageElement ||
							(typeof currentUniform.value === "object" && currentUniform.value !== null && "src" in currentUniform.value)
						) {
							newCustomUniforms[name] = {
								...currentUniform,
								type: "sampler2D",
							};
						} else {
							// 只有当前值不是图片时才设置为null
							newCustomUniforms[name] = {
								value: null,
								type: "sampler2D",
							};
						}
					} else {
						newCustomUniforms[name] = { value: 0.5, type: "float" };
					}
				}
				hasChanges = true;
			}
			// 如果类型已经正确，不做任何修改
		}
	});

	// 删除不再需要的Uniforms
	Object.keys(newCustomUniforms).forEach((name) => {
		if (!uniformNames.includes(name) && name !== "iTime" && name !== "iResolution") {
			delete newCustomUniforms[name];
			hasChanges = true;
		}
	});

	// 只有在有变化时才更新状态
	if (hasChanges) {
		setCustomUniforms(newCustomUniforms);

		// 更新合并后的Uniforms - 保留内置uniforms的值
		const mergedUniforms: Uniforms = {
			...uniforms,
			...newCustomUniforms,
		};

		// 确保内置uniforms不被覆盖
		if (uniforms.iTime) mergedUniforms.iTime = uniforms.iTime;
		if (uniforms.iResolution) mergedUniforms.iResolution = uniforms.iResolution;

		setUniforms(mergedUniforms);
	}
};

/**
 * 检查uniform值是否与目标类型兼容
 * 用于判断是否可以保留现有值而只更新类型信息
 */
export const areUniformValuesCompatible = (value: any, targetType: string): boolean => {
	if (value === null || value === undefined) return true; // null值总是兼容

	switch (targetType) {
		case "float":
			return typeof value === "number";
		case "vec3":
			return typeof value === "object" && "r" in value && "g" in value && "b" in value && Object.keys(value).length === 3;
		case "vec4":
			return typeof value === "object" && "r" in value && "g" in value && "b" in value && "a" in value && Object.keys(value).length === 4;
		case "sampler2D":
			// 更宽松地处理sampler2D兼容性 - 接受HTMLImageElement、有src属性的对象、或者null
			return value instanceof HTMLImageElement || (typeof value === "object" && value !== null && "src" in value) || value === null || value === undefined;
		default:
			return false;
	}
};

/**
 * 比较两个uniform值是否相等
 * 用于判断是否需要更新uniform值
 */
export const areUniformValuesEqual = (a: any, b: any): boolean => {
	// 处理null/undefined情况
	if (a === b) return true;
	if (a == null || b == null) return false;

	// 处理HTMLImageElement（图片）
	if (a instanceof HTMLImageElement && b instanceof HTMLImageElement) {
		return a.src === b.src;
	}

	// 处理图片对象比较（一个HTMLImageElement，一个有src属性的对象）
	if (
		(a instanceof HTMLImageElement && typeof b === "object" && b !== null && "src" in b) ||
		(typeof a === "object" && a !== null && "src" in a && b instanceof HTMLImageElement)
	) {
		return a.src === b.src;
	}

	// 处理对象（vec3/vec4）
	if (typeof a === "object" && typeof b === "object") {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;

		for (const key of keysA) {
			if (a[key] !== b[key]) return false;
		}
		return true;
	}

	// 处理基本类型
	return a === b;
};
