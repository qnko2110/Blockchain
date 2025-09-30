let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';


( async () => {
    
    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
    
    let queue = 'test';
    let message = 'Send message with default exchange.'
    await channel.assertQueue(queue, {
        durable: false
    });
    await channel.sendToQueue(queue, Buffer.from(message));
    console.log(`$Sent: "${message}"`)
    setTimeout( () => {
        channel.close();
        connection.close();
    }, 250);
}) ();