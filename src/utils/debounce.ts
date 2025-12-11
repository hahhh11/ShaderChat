/**
 * 防抖函数 - 延迟执行函数，避免频繁调用
 * @param func 要执行的函数
 * @param wait 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	
	return function (...args: Parameters<T>) {
		if (timeout) {
			clearTimeout(timeout);
		}
		
		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	};
}