let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';


( async () => {
    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
    let exchangeName = 'fanout_exchange';
    let exchangeType = 'fanout';
    let message = 'Sent message with fanout exchange.';
    await channel.assertExchange(exchangeName, exchangeType, {
        durable: false
    });
    await channel.publish(exchangeName, '', Buffer.from(message));
    console.log(`Sent: "${message}"`);
    setTimeout( () => {
        channel.close();
        connection.close();
    }, 250);
}) (); 
