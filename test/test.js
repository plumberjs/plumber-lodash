var chai = require('chai');
chai.should();

var runAndCompleteWith = require('plumber-util-test').runAndCompleteWith;

var Resource = require('plumber').Resource;

var lodash = require('..');

function createResource(params) {
  return new Resource(params);
}

function resourcesError() {
  chai.assert(false, "error in resources observable");
}


describe('lodash', function(){
  it('should be a function', function(){
    lodash.should.be.a('function');
  });

  it('should return a function', function(){
    lodash().should.be.a('function');
  });

  it('should return the whole of lodash by default', function(done){
    // This is actually very slow
    this.timeout(10 * 1000);

    runAndCompleteWith(lodash(), [], function(lodashResource) {
      lodashResource.length.should.equal(1);
      lodashResource[0].type().should.equal('javascript');
      lodashResource[0].filename().should.equal('lodash.js');
      // Lame AMD detection
      lodashResource[0].data().should.contain('define(');
    }, resourcesError, done);
  });

  it('should return sources for the functions in the includes list', function(done){
    // This is actually very slow
    this.timeout(10 * 1000);

    var options = {include: ['each']};
    runAndCompleteWith(lodash(options), [], function(lodashResource) {
      lodashResource.length.should.equal(1);
      // Arbitrary function that should probably not be there:
      lodashResource[0].data().should.not.contain('lodash.pull');
    }, resourcesError, done);
  });

  // TODO: check for sourceMap
});
