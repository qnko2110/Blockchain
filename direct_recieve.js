let amqp = require('amqplib');
require('dotenv').config();
const URL = 'amqps://pqxbpggf:K1aB4MiE-pc2VVlkZiYSQEzI5yMXoW_w@kangaroo.rmq.cloudamqp.com/pqxbpggf';
( async () => {
    var bindingKeys = process.argv.slice(2);
    if (bindingKeys.length === 0 ){
        bindingKeys = ['red'];
    }
    let connection = await amqp.connect(`${URL}`, 'heartbeat=60');
    let channel = await connection.createChannel();
    let exchangeName = 'direct_exchange';
    let exchangeType = 'direct';
    await channel.assertExchange(exchangeName, exchangeType, {
        durable: false
    });
    let queueObject = await channel.assertQueue('', {
        exclusive: true
    });
    bindingKeys.forEach((bindingKey) => {
        channel.bindQueue(queueObject.queue, exchangeName, bindingKey);
    });
    let bindingKeysAsString = bindingKeys.toString();
    console.log(`Biding keys: ${bindingKeysAsString}`);
    console.log(`Waiting for messages...`);
    await channel.consume(queueObject.queue, (data) =>{
        let message = data.content.toString();
        let routingKey = data.fields.routingKey;
        console.log(`Message recieved: "${message}", routing key: ${routingKey}`);
    }, {
        noAck: true
    });
}) ();