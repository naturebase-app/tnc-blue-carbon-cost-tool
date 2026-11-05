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

  test('returns selected email audiences as a deduplicated union', async () => {
    const activeUser = await testManager.mocks().createUser({
      email: 'active@example.com',
      isActive: true,
    });
    const activeProjectUser = await testManager.mocks().createUser({
      email: 'active-project@example.com',
      isActive: true,
    });
    const inactiveProjectUser = await testManager.mocks().createUser({
      email: 'inactive-project@example.com',
      isActive: false,
    });
    await testManager.mocks().createUser({
      email: 'inactive-no-project@example.com',
      isActive: false,
    });
    await testManager.ingestCountries();
    await testManager.mocks().createCustomProject({ user: activeProjectUser });
    await testManager
      .mocks()
      .createCustomProject({ user: inactiveProjectUser });
    await testManager
      .mocks()
      .createCustomProject({ user: inactiveProjectUser });

    const getEmails = (categories: string) =>
      testManager
        .request()
        .get(`${adminContract.listUserEmails.path}?categories=${categories}`)
        .set('Authorization', 'Bearer ' + adminJwtToken);

    const allUsersResponse = await getEmails('all');
    const activeUsersResponse = await getEmails('active');
    const savedProjectUsersResponse = await getEmails('saved-projects');
    const combinedResponse = await getEmails('active,saved-projects');
    const emptyResponse = await getEmails('');

    expect(allUsersResponse.status).toBe(HttpStatus.OK);
    expect(allUsersResponse.body.data).toEqual(
      expect.arrayContaining([
        'test@user.com',
        'active@example.com',
        'active-project@example.com',
        'inactive-project@example.com',
        'inactive-no-project@example.com',
      ]),
    );
    expect(activeUsersResponse.status).toBe(HttpStatus.OK);
    expect(activeUsersResponse.body.data).toEqual(
      expect.arrayContaining([
        'test@user.com',
        'active@example.com',
        'active-project@example.com',
      ]),
    );
    expect(activeUsersResponse.body.data).not.toContain(
      'inactive-project@example.com',
    );
    expect(savedProjectUsersResponse.status).toBe(HttpStatus.OK);
    expect(savedProjectUsersResponse.body.data).toEqual([
      'active-project@example.com',
      'inactive-project@example.com',
    ]);
    expect(combinedResponse.status).toBe(HttpStatus.OK);
    expect(combinedResponse.body.data).toEqual(
      expect.arrayContaining([
        'test@user.com',
        'active@example.com',
        'active-project@example.com',
        'inactive-project@example.com',
      ]),
    );
    expect(combinedResponse.body.data).not.toContain(
      'inactive-no-project@example.com',
    );
    expect(
      combinedResponse.body.data.filter(
        (email: string) => email === 'inactive-project@example.com',
      ),
    ).toHaveLength(1);
    expect(emptyResponse.status).toBe(HttpStatus.OK);
    expect(emptyResponse.body.data).toEqual([]);
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

  test('returns account and saved project statistics', async () => {
    const activeRecentUser = await testManager.mocks().createUser({
      email: 'active-recent@example.com',
      isActive: true,
    });
    const inactiveRecentUser = await testManager.mocks().createUser({
      email: 'inactive-recent@example.com',
      isActive: false,
    });
    const activeOldUser = await testManager.mocks().createUser({
      email: 'active-old@example.com',
      isActive: true,
    });
    await testManager.ingestCountries();
    const projectUpdatedWithin90Days = await testManager
      .mocks()
      .createCustomProject({
        user: activeRecentUser,
      });
    const projectUpdatedOutside90Days = await testManager
      .mocks()
      .createCustomProject({
        user: inactiveRecentUser,
      });
    const recentlyEditedProject = await testManager
      .mocks()
      .createCustomProject({
        user: activeOldUser,
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
    await testManager.getDataSource().query(
      `UPDATE custom_projects
       SET updated_at = CASE id
         WHEN $1 THEN CURRENT_TIMESTAMP - INTERVAL '90 days' + INTERVAL '1 hour'
         WHEN $2 THEN CURRENT_TIMESTAMP - INTERVAL '90 days' - INTERVAL '1 hour'
         WHEN $3 THEN CURRENT_TIMESTAMP - INTERVAL '10 days'
       END
       WHERE id IN ($1, $2, $3)`,
      [
        projectUpdatedWithin90Days.id,
        projectUpdatedOutside90Days.id,
        recentlyEditedProject.id,
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
      savedCustomProjects: 3,
      customProjectsUpdatedLast90Days: 2,
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
