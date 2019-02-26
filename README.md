DAS-CLI
=======
Simple Command Line Interface (CLI) tool to set colors on the Das Keyboard.

This is really just a frontend for the excellent work on the [@diefarbe/lib](https://github.com/diefarbe/node-lib) module which handles the low-level communication with the device. Something that Das have yet to live up to.


```
Usage: das [options] [key=color...]

Options:
  -V, --version           output the version number
  -a, --all <color>       Set all keys to a static color
  -n, --dry-run           Dont actually command the keyboard, just simulate (implies `-v`)
  -v, --verbose           Be verbose
  --lang <language code>  Set the language code to use (default is "en-US") (default: "en-US")
  --no-color              Disable colors
  --help                  This help screen
  --help-groups           Print all known key groups
  --help-colors           Print all known color aliases
  --help-langs            Print all known language codes
  --help-keys             Print all known keycodes
  -h, --help              output usage information
```

Keys can be specified individually or as named groups - use `--help-groups` to see a list of the supported group names.

Examples
--------

```
# Set all keys to Blue
das all=blue

# Set all numpad keys to green
das numpad=green

# Set all keys to black then all alpha keys to aliceblue and number keys to yellow
das all=black alpha=aliceblue numbers=yellow
```


Installation
============

1. [Install NodeJS](https://nodejs.org/en/download) if you don't already have it.

2. Install as a global NPM using `npm install -g das-cli`

3. You should now be able to use the command line. Test it with `sudo das all=blue`

4. If you don't want to keep using `sudo` to escalate the program to root follow the [instructions here](https://github.com/diefarbe/node-lib#permissions-on-linux)
