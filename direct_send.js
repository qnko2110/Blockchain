let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';


( async () => {
    let args = process.argv.slice(2);
    let routingKey = (args.length > 0) ? args[0] : 'red';

    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
    let exchangeName = 'direct_exchange';
    let exchangeType = 'direct';
    let message = 'Sent message with direct exchange.';
    await channel.assertExchange(exchangeName, exchangeType, {
        durable: false
    });
    await channel.publish(exchangeName, routingKey, Buffer.from(message));
    console.log(`Routing key: ${routingKey}`);
    console.log(`Sent: "${message}"`);
    const sentTimeout = 250;
}) ();