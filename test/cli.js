var exec = require('child_process').exec;
var expect = require('chai').expect;

describe('CLI tests', ()=> {

	var cwd = `${__dirname}/..`;

	it('should set all alpha chars on the keyboard to one color', done => {
		exec('app.js --dry-run alpha=red', {cwd}, (err, res) => {
			console.log('GOT', res);
			expect(err).to.be.not.ok;
			done();
		});
	});

});
