import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const obfuscate = {
	ecma: 2020,
	compress: {
		drop_console: true,
		drop_debugger: true,
		hoist_funs: true,
		module: true,
		toplevel: true,
	},
	mangle: {
		properties: {
			regex: /^[#_]/,
		}
	},
};

export default [
	{
		input: './src/index.ts',
		output: [
			{
				file: 'dist/trakit-react.min.js',
				format: 'es',
				exports: 'named',
				plugins: [terser(obfuscate)]
			}
		],
		plugins: [
			//json(),
			typescript({
				tsconfig: './tsconfig.json',
				//tsconfigOverride: {
				//	compilerOptions: {
				//		declaration: false,
				//	}
				//}
			})
		],
		external: [
			'@trakit/objects',
			'@trakit/commands',
			'@trakit/sync',
			'react',
		],
	}
];