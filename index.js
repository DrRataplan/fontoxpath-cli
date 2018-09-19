const fontoxpath = require('fontoxpath');
const fs = require('fs');
const path = require('path');
const slimdomSaxParser = require('slimdom-sax-parser');
const args = process.argv;

fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: 'fontoxpath-cli',
		localName: 'doc'
	},
	['xs:string'],
	'item()',
	(_dynamicContext, filePath) => {
		const xmlString = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
		return slimdomSaxParser.sync(xmlString);
	});

fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: 'fontoxpath-cli',
		localName: 'load-file'
	},
	['xs:string'],
	'item()',
	(_dynamicContext, filePath) => {
		return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
	});

fontoxpath.registerCustomXPathFunction(
	{
		namespaceURI: 'fontoxpath-cli',
		localName: 'serialize-xml'
	},
	['node()'],
	'xs:string',
	(_dynamicContext, node) => {
		return new slimdomSaxParser.slimdom.XMLSerializer().serializeToString(node);
	});

fontoxpath.registerXQueryModule(fs.readFileSync('./cli.xqm', 'utf-8'));

const imports = args.forEach((arg, i) => {
	if (arg === '--import') {
		fontoxpath.registerXQueryModule(
			fs.readFileSync(path.resolve(process.cwd(), args[i + 1]), 'utf-8')
		);
	}
});


console.log(fontoxpath.evaluateXPathToString(
	'cli:run($args)',
	null,
	null,
	{
		args: args
	},
	{
		moduleImports: {
			cli: 'fontoxpath-cli'
		}
	}
));
