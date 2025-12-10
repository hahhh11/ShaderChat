/*
 * @Author: 98Precent
 * @Date: 2025-12-09 15:35:00
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-10 11:13:58
 * @FilePath: /ShaderChat/vite.config.ts
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.BASE_URL || "/",
	plugins: [react()],
});
