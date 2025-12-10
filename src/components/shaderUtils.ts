import { Uniforms } from "./types";

export const getUniformType = (fsSource: string, uniformName: string): "float" | "vec3" | "vec4" => {
	const floatRegex = new RegExp(`uniform\\s+float\\s+${uniformName};`);
	const vec3Regex = new RegExp(`uniform\\s+vec3\\s+${uniformName};`);
	const vec4Regex = new RegExp(`uniform\\s+vec4\\s+${uniformName};`);

	if (floatRegex.test(fsSource)) return "float";
	if (vec3Regex.test(fsSource)) return "vec3";
	if (vec4Regex.test(fsSource)) return "vec4";
	return "float"; // 默认返回float
};

export const discoverUniformNames = (fsSource: string): string[] => {
	const floatRegex = /uniform\s+float\s+([a-zA-Z_]\w*);/g;
	const vec3Regex = /uniform\s+vec3\s+([a-zA-Z_]\w*);/g;
	const vec4Regex = /uniform\s+vec4\s+([a-zA-Z_]\w*);/g;
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

	// 添加或初始化新的Uniforms
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
	});

	// 删除不再需要的Uniforms
	Object.keys(newCustomUniforms).forEach((name) => {
		if (!uniformNames.includes(name)) {
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
