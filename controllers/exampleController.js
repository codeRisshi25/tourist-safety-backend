import exampleService from '../services/exampleService.js';

const getExample = (req, res) => {
    const data = exampleService.getExampleData();
    res.json({ message: 'Example route', data });
};

export default { getExample };
