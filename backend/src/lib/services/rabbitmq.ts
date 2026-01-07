import amqp from 'amqplib';

const connectRabbitMQ = async () => {
    let username = process.env["RABBIT_USER"] || "admin";
    let password = process.env["RABBIT_PASS"] || "admin";
    let host = process.env["RABBIT_HOST"] || "myfairpipe.com";
    let port = process.env["RABBIT_PORT"] || "5672";

    let url = username + ":" + password + "@" + host + ":" + port;

    try {
        const connection = await amqp.connect('amqp://' + url);
        const channel = await connection.createChannel();
        return { connection, channel };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
};

export const sendMessage = async (queue: string, message: string) => {
    const { channel } = await connectRabbitMQ();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));
};

export const consumeMessages = async (queue: string) => {
    const { channel } = await connectRabbitMQ();
    await channel.assertQueue(queue, { durable: true });

    await channel.consume(queue, (message) => {
        if (message) {
            channel.ack(message); // Acknowledge message
        }
    });
};