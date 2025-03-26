module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier', 'n8n-nodes-base'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: [
		'.eslintrc.js',
		'dist/**/*',
		'package.json',
		'package-lock.json'
	],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'n8n-nodes-base/node-param-description-missing-regex': 'off',
		'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',
		'n8n-nodes-base/node-param-description-missing-for-ignore-ssl-issues': 'off',
		'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
	},
}; 