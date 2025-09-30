let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';
( async () => {
    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
    let exchangeName = 'fanout_exchange';
    let exchangeType = 'fanout';
    await channel.assertExchange(exchangeName, exchangeType, {
        durable: false
    });
    let queueObject = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.bindQueue(queueObject.queue, exchangeName, '');
    console.log(`Waiting for messages...`);
    await channel.consume(queueObject.queue, (data) =>{
        let message = data.content.toString();
        console.log(`Message recieved: "${message}"`);
    }, {
        noAck: true
    });
}) ();