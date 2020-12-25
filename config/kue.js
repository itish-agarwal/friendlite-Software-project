const kue = require('kue');
const queue = kue.createQueue();


module.exports = queue;

//with this thing done, next is to create a worker for us
