#!/usr/bin/env node

var _ = require('lodash');
var chalk = require('chalk');
var colorNames = require('color-name');
var das = require('@diefarbe/lib');
var keyGroups = require('./lib/keyGroups');
var fs = require('fs');
var program = require('commander');
var rgbHex = require('rgb-hex');
var keyboard;

program
	.version(require('./package.json').version)
	.usage('[options] [key=color...]')
	.option('-a, --all <color>', 'Set all keys to a static color')
	.option('-n, --dry-run', 'Dont actually command the keyboard, just simulate (implies `-v`)')
	.option('-v, --verbose', 'Be verbose')
	.option('--lang <language code>', 'Set the language code to use (default is "en-US")', 'en-US')
	.option('--no-color', 'Disable colors')
	.option('--help', 'This help screen')
	.option('--help-groups', 'Print all known key groups')
	.option('--help-colors', 'Print all known color aliases')
	.option('--help-langs', 'Print all known language codes')
	.option('--help-keys', 'Print all known keycodes')
	.on('option:help', ()=> program.outputHelp())
	.parse(process.argv);

Promise.resolve()
	// Option processing {{{
	.then(()=> {
		if (program.dryRun) program.verbose = true;
	})
	// }}}
	// Chore: Convert color codes RGB => hex {{{
	.then(()=> {
		colorNames = _.mapValues(colorNames, c => '#' + rgbHex(...c));
	})
	// }}}
	// Chore: Flatten key groups {{{
	.then(()=> {
		keyGroups = _.mapValues(keyGroups, g =>
			_.isArray(g) ? g
			: _.isFunction(g) ?
				_(das.KeyInfo[program.lang])
					.pickBy(g)
					.map((v, k) => k)
					.value()
			: g
		);
	})
	// }}}
	// --help-* {{{
	.then(()=> {
		if (program.helpGroups) {
			console.log('Supported groups:');
			_(keyGroups)
				.keys()
				.sort()
				.forEach(l => console.log(l));
		}
		if (program.helpColors) {
			console.log('Supported colors:');
			_(colorNames)
				.keys()
				.sort()
				.forEach(l => console.log(l));
		}
		if (program.helpLangs) {
			console.log('Supported languages:');
			_(das.KeyInfo)
				.keys()
				.sort()
				.forEach(l => console.log(l));
		}
		if (program.helpKeys) {
			console.log('Supported key codes:');
			_(das.KeyInfo[program.lang])
				.keys()
				.sort()
				.forEach(k => console.log(k));
		}

		if (program.helpGroups || program.helpColors || program.helpLangs || program.helpKeys) throw 'EXIT';
	})
	// }}}
	// Connect to keyboard and return the session object (if !dryRun) {{{
	.then(()=> {
		if (program.dryRun) return;

		keyboard = new das.Keyboard();
		var hidDevice = keyboard.find();
		keyboard.initialize();
	})
	// }}}
	// Parse args into a set list {{{
	.then(()=> {
		var changeCount = 0;
		var syntaxSplitter = /^(.+?)\s*=\s*(.+)$/;
		var errs = [];
		program.args.forEach(a => {
			var syntax = syntaxSplitter.exec(a);
			if (!syntax) return errs.push(`Unknown syntax "${a}"`);

			// Lookup keys
			var keys;
			if (_.has(das.KeyInfo[program.lang], syntax[1])) { // Valid single key name
				keys = [syntax[1]];
			} else if (keyGroups[syntax[1]]) { // Valid group name
				keys = keyGroups[syntax[1]];
			} else {
				return errs.push(`Unknown key or group name "${syntax[1]}"`);
			}

			// Lookup color
			var color;
			if (syntax[2].startsWith('#')) { // Already a hex code
			       color = syntax[2];
			} else if (colorNames[syntax[2]]) { // Valid color lookup
				color = colorNames[syntax[2]];
			} else {
				return errs.push(`Unknown color "${syntax[2]}"`);
			}


			if (program.verbose) console.log(`Change keys ${keys.join(', ')} to color ${color}`);
			if (!program.dryRun) {
				keys.forEach(keyCode => {
					keyboard.setKeyState(new das.KeyState(das.KeyInfo[program.lang][keyCode]).setToColorHex(color));
					changeCount++;
				});
			}
		})
		if (changeCount) {
			if (program.verbose) console.log(`Making ${changeCount} writes to keyboard`);
			keyboard.apply();
		}

		if (errs.length) throw errs;
	})
	// }}}
	// End {{{
	.finally(()=> {
		if (keyboard) keyboard.close();
	})
	.catch(e => {
		if (e === 'EXIT') return process.exit(0);
		console.log(e.toString());
		process.exit(1);
	})
	// }}}
