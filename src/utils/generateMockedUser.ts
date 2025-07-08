export const generateMockedUser = (alterations?: {}) => {
  const user = {
    username: `MockUser${Date.now()}`,
    firstName: 'Mock',
    lastName: 'User',
    password: '123456',
    ...alterations,
  };

  return user;
};
