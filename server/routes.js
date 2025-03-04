// @ts-check

import _ from 'lodash';

const getNextId = () => Number(_.uniqueId());

const buildState = (defaultState) => {
  const primaryListId = getNextId();
  const secondaryListId = getNextId();
  const state = {
    lists: [
      { id: primaryListId, name: 'primary', removable: false },
      { id: secondaryListId, name: 'secondary', removable: true },
    ],
    tasks: [],
    currentListId: primaryListId,
  };

  if (defaultState.tasks) {
    state.tasks.push(...defaultState.tasks);
  }
  if (defaultState.lists) {
    state.lists.push(...defaultState.lists);
  }
  if (defaultState.currentListId) {
    state.currentListId = defaultState.currentListId;
  }

  return state;
};

export default (app, defaultState = {}) => {
  const state = buildState(defaultState);

  app
    .get('/', (_req, reply) => {
      reply.view('index.pug', { gon: state });
    })
    .post('/api/v1/lists', (req, reply) => {
      let { name } = req.body;
      name = name.trim();
      const list = {
        name,
        removable: true,
        id: getNextId(),
      };
      state.lists.push(list);

      reply.code(201).send(list);
    })
    .delete('/api/v1/lists/:id', (req, reply) => {
      const listId = Number(req.params.id);
      state.lists = state.lists.filter((l) => l.id !== listId);
      state.tasks = state.tasks.filter((t) => t.listId !== listId);

      reply.code(204).send();
    })
    .post('/api/v1/lists/:id/tasks', (req, reply) => {
      const { text } = req.body;
      const task = {
        text,
        listId: Number(req.params.id),
        id: getNextId(),
        completed: false,
        touched: Date.now(),
      };
      state.tasks.push(task);
      reply.code(201).send(task);
    })
    .patch('/api/v1/tasks/:id', (req, reply) => {
      const taskId = Number(req.params.id);
      const { completed } = req.body;
      const task = state.tasks.find((t) => t.id === taskId);
      task.completed = completed;
      task.touched = Date.now();
      reply.code(201).send(task);
    })
    .delete('/api/v1/tasks/:id', (req, reply) => {
      const taskId = Number(req.params.id);
      state.tasks = state.tasks.filter((t) => t.id !== taskId);

      reply.code(204).send();
    });
};
