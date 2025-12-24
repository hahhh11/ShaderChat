export interface UniformValue {
	value:
		| number
		| { x: number; y: number; z?: number }
		| { r: number; g: number; b: number }
		| { r: number; g: number; b: number; a: number }
		| ImageData
		| { src: string; width?: number; height?: number } // 新的图片数据格式å
		| null;
	type?: "float" | "vec2" | "vec3" | "color" | "vec4" | "sampler2D";
}

export interface Uniforms {
	[key: string]: UniformValue;
	iTime: { value: number };
	iResolution: { value: { x: number; y: number; z?: number }; type?: "vec2" | "vec3" };
}

export interface Message {
	text: string;
	sender: "assistant" | "user";
	metadata?: {
		type?: string;
		parsed?: any;
		originalText?: string;
	};
}

export interface CodeEditorProps {
	id: string;
	defaultValue: string;
	onChange: (value: string) => void;
}

export interface ShaderMaterialProps {
	uniforms: Uniforms;
	vertexShader: string;
	fragmentShader: string;
}

export interface ModelConfig {
	id: string;
	name: string;
	address: string;
	model: string;
	apiKey: string;
}

export interface ChatDrawerProps {
	isOpen: boolean;
	onToggle: () => void;
	messages: Message[];
	onSendMessage: (message: string) => void;
	inputMessage: string;
	setInputMessage: (value: string) => void;
	models: ModelConfig[];
	setModels: (models: ModelConfig[]) => void;
	selectedModel: string;
	setSelectedModel: (model: string) => void;
}
