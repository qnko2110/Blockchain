let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';
( async () => {
    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
   
    let queue = 'test';
    await channel.assertQueue(queue, {
        durable: false
    });
    console.log(`Waiting for messages in ${queue} queue...`);
    await channel.consume(queue, (data) =>{
        let message = data.content.toString();
        console.log(`Message recieved: "${message}"`);
    }, {
        noAck: true
    });
}) ();