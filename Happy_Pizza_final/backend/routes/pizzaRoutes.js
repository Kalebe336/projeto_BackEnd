const express = require('express');
const router = express.Router();
const controller = require('../controllers/pizzaControllers');

router.get('/', controller.listarPizzas);
router.get('/:id', controller.buscarPizza);
router.post('/', controller.criarPizza);
router.put('/:id', controller.atualizarPizza);
router.delete('/:id', controller.excluirPizza);
router.post('/:id/curtir', controller.curtirPizza);
router.delete('/:id/curtir', controller.descurtirPizza);
router.get('/:id/comentarios', controller.listarComentarios);
router.post('/:id/comentarios', controller.comentarPizza);

module.exports = router;
