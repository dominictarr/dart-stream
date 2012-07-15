var spec = require('stream-spec')
var tester = require('stream-tester')
var ds     = require('..')()

spec(ds)
  .through({strict: false})
  .validateOnExit()

var master

tester.createRandomStream(1000) //1k random numbers
  .pipe(master = tester.createConsistentStream())
  .pipe(tester.createUnpauseStream())
  .pipe(ds)
  .pipe(tester.createPauseStream())
  .pipe(master.createSlave())

