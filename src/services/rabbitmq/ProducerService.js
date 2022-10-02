const ampq = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await ampq.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    // memastikan queue sudah di initialize
    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
