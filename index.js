
var Stream = require('stream')

/*
  could probably refactor this into two seperate function that created 
  the readable and writable sides.
*/

module.exports = function (readable, ended) {

  readable = readable || function () {
    var data
    while(data = this.readIn())
      this.writeData(data)
  }

  ended = ended || function () {
    this.writeEnd()
    var self = this
    this.on('end', function () {
      self.destroy()
    })
  }

  var stream = new Stream()
  stream.readable = stream.writable = true
  var inbuf = [], outbuf = [], drained = false

  stream.on('readable', readable.bind(stream))
  stream.on('ended', ended.bind(stream))

  stream.write = function (data) {
    inbuf.unshift(data)    
    this.emit('readable')
    return !!inbuf.length
  }
  stream.readIn = function () {
    if(!inbuf.length) {
      if(!drained)
        drained = true, this.emit('drain')
      if(this.readEnded)
        this.emit('ended')
      return null
    }
    return inbuf.shift() 
  }
  stream.writeData = function (data) {
    if(this.readEnd)
      throw new Error('cannot write data after calling writeEnd')
    outbuf.push(data)
    this.drain()
  }
  stream.end = function () {
    this.readEnded = true
    this.writable = false
    if(!inbuf.length)
      this.emit('ended')
  }
  stream.writeEnd = function () {
    if(this.readEnded) return
    this.readEnded = true
    if(outbuf.length) {
      this.on('drain', function () {
        ended.call(stream)
      })
      this.drain()
    }
    else
      ended.call(this)
  }
  stream.drain = function (drain) {
    while(!this.paused && outbuf.length)
      this.emit('data', outbuf.shift())
    if(this.readEnded && !this.paused)
      this.readable = false, this.emit('end')
  }
  stream.pause = function () {
    this.paused = true
  }
  stream.resume = function () {
    if(!this.paused) return
    this.paused = false
    if(!outbuf.length) return
    this.drain()
    this.emit('drain')
  }
  stream.destroy = function () {
    inbuf.length = outbuf.length = 0
    this.readable = this.writable = false
    this.emit('close')
  }
  return stream
}

