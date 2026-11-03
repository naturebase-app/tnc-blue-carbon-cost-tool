import { HttpStatus } from '@nestjs/common';
import { ROLES } from '@shared/entities/users/roles.enum';
import { adminContract } from '@shared/contracts/admin.contract';
import { TestManager } from '../../utils/test-manager';

describe('Admin user data', () => {
  let testManager: TestManager;
  let adminJwtToken: string;

  beforeAll(async () => {
    testManager = await TestManager.createTestManager();
  });

  beforeEach(async () => {
    const { jwtToken } = await testManager.setUpTestUser();
    adminJwtToken = jwtToken;
  });

  afterEach(async () => {
    await testManager.clearDatabase();
  });

  afterAll(async () => {
    await testManager.close();
  });

  test('returns distinct non-empty emails for active users only', async () => {
    await testManager.mocks().createUser({
      email: 'Copy@example.com',
      isActive: true,
    });
    await testManager.mocks().createUser({
      email: 'copy@example.com',
      isActive: true,
    });
    await testManager.mocks().createUser({
      email: 'inactive@example.com',
      isActive: false,
    });
    await testManager.mocks().createUser({
      email: '   ',
      isActive: true,
    });

    const response = await testManager
      .request()
      .get(adminContract.listUserEmails.path)
      .set('Authorization', `Bearer ${adminJwtToken}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toContain('test@user.com');
    expect(response.body.data).not.toContain('inactive@example.com');
    expect(response.body.data).not.toContain('   ');
    expect(
      response.body.data.filter(
        (email: string) => email.toLowerCase() === 'copy@example.com',
      ),
    ).toHaveLength(1);
  });

  test('rejects non-admin users', async () => {
    const user = await testManager.mocks().createUser({
      email: 'user@example.com',
      role: ROLES.USER,
      isActive: true,
    });
    const { jwtToken } = await testManager.logUserIn(user);

    const response = await testManager
      .request()
      .get(adminContract.listUserEmails.path)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });

  test('returns active and recently created account counts', async () => {
    await testManager.mocks().createUser({
      email: 'active-recent@example.com',
      isActive: true,
    });
    await testManager.mocks().createUser({
      email: 'inactive-recent@example.com',
      isActive: false,
    });
    await testManager.mocks().createUser({
      email: 'active-old@example.com',
      isActive: true,
    });
    await testManager.getDataSource().query(
      `UPDATE users
       SET created_at = CASE email
         WHEN $1 THEN CURRENT_TIMESTAMP - INTERVAL '90 days' + INTERVAL '1 hour'
         WHEN $2 THEN CURRENT_TIMESTAMP - INTERVAL '10 days'
         WHEN $3 THEN CURRENT_TIMESTAMP - INTERVAL '90 days' - INTERVAL '1 hour'
       END
       WHERE email IN ($1, $2, $3)`,
      [
        'active-recent@example.com',
        'inactive-recent@example.com',
        'active-old@example.com',
      ],
    );

    const response = await testManager
      .request()
      .get(adminContract.getUserStatistics.path)
      .set('Authorization', 'Bearer ' + adminJwtToken);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual({
      activeUsers: 3,
      usersCreatedLast90Days: 3,
    });
  });

  test('rejects non-admin users from account statistics', async () => {
    const user = await testManager.mocks().createUser({
      email: 'statistics-user@example.com',
      role: ROLES.USER,
      isActive: true,
    });
    const { jwtToken } = await testManager.logUserIn(user);

    const response = await testManager
      .request()
      .get(adminContract.getUserStatistics.path)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
