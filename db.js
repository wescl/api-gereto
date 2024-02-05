const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://wescleyasr:MigeiYyUlkeb8TEX@teste.phdffpl.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
};

const getClient = () => new MongoClient(uri);

module.exports = { connectToDatabase, getClient };
