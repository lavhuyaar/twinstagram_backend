export const generateMockedUser = (alterations?: {}) => {
  const user = {
    username: `MockUser${Date.now()}${Math.floor(Math.random() * 100)}`,
    firstName: 'Mock',
    lastName: 'User',
    password: '123456',
    ...alterations,
  };

  return user;
};
