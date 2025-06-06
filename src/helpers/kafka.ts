import { Kafka, Producer, Consumer } from 'kafkajs';
import { Kafka as messages } from '../messages';
import { env } from '.';
class KafkaWorker {
	private broker: string;
	private conditions: { producer: boolean; consumer: boolean; };
	private clientId: string;
	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;
	private topics: string[];
	constructor (broker: string, clientId: string, topics: string[]) {
		this.broker = broker;
		this.conditions = { producer: false, consumer: false };
		this.clientId = clientId;
		this.kafka = new Kafka({
			clientId: this.clientId,
			brokers: [this.broker]
		});
		this.producer = this.kafka.producer();
		this.consumer = this.kafka.consumer({ groupId: env.kafkaGroupId });
		this.topics = topics;
	}
	public async consume (callback?: (record: Record<string, any>) => Promise<void> | void) {
		for (const topic of this.topics) {
			await this.consumer
				.subscribe({
					topic,
					fromBeginning: true
				})
				.catch(error => {
					messages.error(error, `Failed to subscribe to topic: ${topic}`);
				});
		}
		await this.consumer.connect();
		this.conditions.consumer = true;
		await this.consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				const service = (topic.charAt(0).toUpperCase() + topic.slice(1)).slice(0, -1);
				try {
					const record = JSON.parse(message.value!.toString());
					await callback?.(record);
				} catch (error: any) {
					messages.error(error, `Failed to create ${service}`);
				}
			}
		});
	}
	public async produce () {
		await this.producer.connect();
		this.conditions.producer = true;
	}
	public async send (record: Record<string, any>, topic: string) {
		await this.producer.send({
			topic,
			messages: [
				{
					value: JSON.stringify(record)
				}
			]
		});
	}
	public close () {
		if (this.conditions.producer) this.producer.disconnect();
		if (this.conditions.consumer) this.consumer.disconnect();
		messages.close();
	}
}
export default new KafkaWorker(env.kafkaBroker, env.kafkaClientId, env.topics);
// TODO: Add Documentation