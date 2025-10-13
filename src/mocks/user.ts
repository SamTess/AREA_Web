import { UserContent } from '../types';

export const mockUser: UserContent = {
  id: "1",
  name: 'Test Tester',
  email: 'user@example.com',
  avatarSrc: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
  isAdmin: true,
  profileData: {
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'Tester',
    language: 'English',
    password: 'test1234',
  },
};