import prisma from '../prisma/client.js';

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id) => {
  // Accept either numeric user_id or id
  return await prisma.user.findUnique({ where: { user_id: parseInt(id) } });
};

export const createUser = async (data) => {
  return await prisma.user.create({ data });
};

export const updateUser = async (id, data) => {
  return await prisma.user.update({ where: { user_id: parseInt(id) }, data });
};
