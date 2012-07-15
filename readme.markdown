#DartStream

create a duplex stream kinda like how I imagine they might in dart.

``` js

var dartStream = require('dart-stream')

var ds = dartStream(function readable () {
      //get data like this:
      var data
      while(data = this.readIn()){
        //write data like this:
        this.writeOut(data)
      } 

    }, function ended() {
      this.writeEnd()
    })

```

streams are buffered at both the readable and the writable side.


## tests
this stream is tested with [stream-spec](https://github.com/dominictarr/stream-spec) and [stream-tester](https://github.com/dominictarr/stream-tester)
