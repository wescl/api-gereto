const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { v4: uuid } = require('uuid');
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

const app = express();
const port = process.env.PORT || 5000;

// Configuração do CORS
const corsOptions = {
  origin: 'https://gereto.netlify.app', // Substitua pelo domínio do seu frontend
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

connectToDatabase();

async function insertCategories() {
  const categoriesData = [
    { "name": "Infraestrutura" },
    { "name": "Desenvolvimento" },
    { "name": "Design" },
    { "name": "Planejamento" }
  ];

  try {
    const client = getClient();
    const database = client.db('Teste');
    const categoriesCollection = database.collection('categories');
    const existingCategories = await categoriesCollection.find({}).toArray();

    if (existingCategories.length === 0) {
      await categoriesCollection.insertMany(categoriesData);
      console.log('Categorias inseridas com sucesso.');
    } else {
      console.log('Categorias já existem, nenhuma inserção necessária.');
    }
  } catch (error) {
    console.error('Erro ao inserir categorias:', error);
  } finally {
    const client = getClient();
    await client.close();
  }
}

app.get('/api/listar-categorias', async (req, res) => {
  try {
    const client = getClient();
    const database = client.db('Teste');
    const categoriesCollection = database.collection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    res.json(categories);
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    res.status(500).json({ erro: 'Erro ao obter categorias' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.post('/api/inserir-dados', async (req, res) => {
  const { projectName, projectCategory, projectDescription, projectBudget, projectCost, projectServices } = req.body;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');

    const projectToInsert = {
      name: projectName,
      category: projectCategory || 'desenvolvimento',
      description: projectDescription,
      budget: projectBudget || 0,
      cost: projectCost || 0,
      services: projectServices || [],
    };

    const result = await projectsCollection.insertOne(projectToInsert);
    console.log(`Projeto inserido com ID: ${result.insertedId}`);
    res.json({ mensagem: 'Projeto inserido com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir projeto:', error);
    res.status(500).json({ erro: 'Erro ao inserir projeto' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.get('/api/listar-projetos', async (req, res) => {
  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');
    const projects = await projectsCollection.find({}).toArray();

    const projectsToSend = projects.map((project) => ({
      ...project,
      id: project._id.toString(),
    }));

    res.json(projectsToSend);
  } catch (error) {
    console.error('Erro ao obter projetos:', error);
    res.status(500).json({ erro: 'Erro ao obter projetos' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.delete('/api/excluir-projeto/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');

    const result = await projectsCollection.deleteOne({ _id: new ObjectId(projectId) });

    if (result.deletedCount === 1) {
      console.log(`Projeto com ID ${projectId} removido com sucesso`);
      res.json({ mensagem: 'Projeto removido com sucesso' });
    } else {
      console.error(`Projeto com ID ${projectId} não encontrado`);
      res.status(404).json({ erro: 'Projeto não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao excluir projeto com ID ${projectId}:`, error);
    res.status(500).json({ erro: 'Erro ao excluir projeto' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.patch('/api/atualizar-projeto/:id', async (req, res) => {
  const projectId = req.params.id;
  const { name, budget, cost, description, services } = req.body;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');

    const updatedProject = {
      name,
      budget,
      cost,
      description,
      services,
    };

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updatedProject }
    );

    if (result.matchedCount === 1) {
      console.log(`Projeto com ID ${projectId} atualizado com sucesso`);
      res.json({ mensagem: 'Projeto atualizado com sucesso' });
    } else {
      console.error(`Projeto com ID ${projectId} não encontrado`);
      res.status(404).json({ erro: 'Projeto não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao atualizar projeto com ID ${projectId}:`, error);
    res.status(500).json({ erro: 'Erro ao atualizar projeto' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.get('/api/obter-projeto/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');
    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      res.status(404).json({ erro: 'Projeto não encontrado' });
    } else {
      res.json(project);
    }
  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({ erro: 'Erro ao obter projeto' });
  } finally {
    const client = getClient();
    await client.connect();
    await client.close();
  }
});

app.post('/api/adicionar-servico/:id', async (req, res) => {
  const projectId = req.params.id;
  const { name, cost, description } = req.body;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');

    const newService = {
      id: uuid(),
      name,
      cost: parseFloat(cost),
      description,
    };

    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project.cost || typeof project.cost !== 'number') {
      await projectsCollection.updateOne({ _id: new ObjectId(projectId) }, { $set: { cost: 0 } });
    }

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $push: { services: newService }, $inc: { cost: parseFloat(cost) } }
    );

    if (result.matchedCount === 1) {
      console.log(`Serviço adicionado ao projeto com ID ${projectId}`);
      res.json({ mensagem: 'Serviço adicionado com sucesso' });
    } else {
      console.error(`Projeto com ID ${projectId} não encontrado`);
      res.status(404).json({ erro: 'Projeto não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao adicionar serviço ao projeto com ID ${projectId}:`, error);
    res.status(500).json({ erro: 'Erro ao adicionar serviço' });
  } finally {
    const client = getClient();
    await client.close();
  }
});

app.delete('/api/remover-servico/:projectId/:serviceId', async (req, res) => {
  const projectId = req.params.projectId;
  const serviceId = req.params.serviceId;

  try {
    const client = getClient();
    const database = client.db('Teste');
    const projectsCollection = database.collection('projects');
    const projectBeforeRemoval = await projectsCollection.findOne({ _id: new ObjectId(projectId) });

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { services: { id: serviceId } }, $inc: { cost: -projectBeforeRemoval.services.find(service => service.id === serviceId).cost } }
    );

    if (result.matchedCount === 1) {
      console.log(`Serviço removido do projeto com ID ${projectId}`);
      res.json({ mensagem: 'Serviço removido com sucesso' });
    } else {
      console.error(`Projeto com ID ${projectId} não encontrado`);
      res.status(404).json({ erro: 'Projeto não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao remover serviço do projeto com ID ${projectId}:`, error);
    res.status(500).json({ erro: 'Erro ao remover serviço' });
  } finally {
    const client = getClient();
    await client.close();
  }
});

insertCategories();

app.listen(port, () => {
  console.log(`Server está rodando em > http://localhost:${port}`);
});
