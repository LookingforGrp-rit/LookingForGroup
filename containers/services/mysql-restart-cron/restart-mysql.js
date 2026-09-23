// Restarts the MySQL service on a schedule to reset memory fragmentation
// buildup. Deployed as its own tiny Railway service with a Cron Schedule
// (Settings -> Cron Schedule) — Railway runs `npm start` on that schedule
// and this process is expected to exit when done, not stay running.
//
// See ./SETUP.md for how to deploy this and which Variables to set.

const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';

const required = [
  'RAILWAY_API_TOKEN',
  'TARGET_PROJECT_ID',
  'TARGET_SERVICE_ID',
  'TARGET_ENVIRONMENT_ID',
];

for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const {
  RAILWAY_API_TOKEN,
  TARGET_PROJECT_ID,
  TARGET_SERVICE_ID,
  TARGET_ENVIRONMENT_ID,
} = process.env;

async function railwayGraphQL(query, variables) {
  const response = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Project Tokens (the narrowly-scoped, single-environment token type
      // this script is meant to use) authenticate via this header, NOT
      // `Authorization: Bearer` — that header is for broader Account
      // Tokens instead. See SETUP.md.
      'Project-Access-Token': RAILWAY_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (!response.ok || body.errors) {
    throw new Error(
      `Railway API error (${response.status}): ${JSON.stringify(body.errors ?? body)}`,
    );
  }

  return body.data;
}

async function getLatestDeploymentId() {
  const query = `
    query latestDeployment($input: DeploymentListInput!, $first: Int) {
      deployments(input: $input, first: $first) {
        edges {
          node {
            id
            status
            createdAt
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      projectId: TARGET_PROJECT_ID,
      serviceId: TARGET_SERVICE_ID,
      environmentId: TARGET_ENVIRONMENT_ID,
    },
    first: 1,
  };

  const data = await railwayGraphQL(query, variables);
  const deployment = data.deployments.edges[0]?.node;

  if (!deployment) {
    throw new Error('No deployment found for the target service.');
  }

  return deployment.id;
}

async function restartDeployment(deploymentId) {
  const mutation = `
    mutation deploymentRestart($id: String!) {
      deploymentRestart(id: $id)
    }
  `;

  await railwayGraphQL(mutation, { id: deploymentId });
}

async function main() {
  console.log(`[${new Date().toISOString()}] Looking up latest deployment...`);
  const deploymentId = await getLatestDeploymentId();

  console.log(`[${new Date().toISOString()}] Restarting deployment ${deploymentId}...`);
  await restartDeployment(deploymentId);

  console.log(`[${new Date().toISOString()}] Restart triggered successfully.`);
}

main()
  .then(() => {
    // Node doesn't always exit on its own once an async script finishes —
    // fetch's underlying HTTP client can leave a keep-alive connection
    // open in its pool, which keeps the event loop from ever going empty.
    // Exit explicitly rather than relying on that.
    process.exit(0);
  })
  .catch((error) => {
    console.error(`[${new Date().toISOString()}] Restart failed:`, error.message);
    process.exit(1);
  });
