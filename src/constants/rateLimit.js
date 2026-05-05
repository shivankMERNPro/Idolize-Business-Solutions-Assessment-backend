export const rateLimitRules = [
  {
    max: 10,
    windowMins: 1,
    apiEndpoints: ['POST /api/student'],
  },
  {
    max: 60,
    windowMins: 1,
    apiEndpoints: ['GET /api/students', 'GET /api/student/:id'],
  },
  {
    max: 20,
    windowMins: 5,
    options: {
      skipSuccessfulRequests: true,
    },
    apiEndpoints: ['PUT /api/student/:id', 'DELETE /api/student/:id'],
  },
];
