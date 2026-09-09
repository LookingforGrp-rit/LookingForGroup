# MySQL restart cron - setup steps

This is a standalone service that restarts the MySQL service on a schedule
to reset memory fragmentation buildup (see the cost/RAM discussion this
came out of). It's deployed as its own separate Railway service, sourced
from this folder of the monorepo.

## 1. Create the API token

Railway account (top-right avatar) -> Account Settings -> Tokens -> create
a new token. A project-scoped token limited to this one project is safer
than an account-wide token, if that option is available to you.

## 2. Find the three IDs

Open the MySQL service in the Railway dashboard. Look at the URL:

    railway.com/project/<PROJECT_ID>/service/<SERVICE_ID>?environmentId=<ENVIRONMENT_ID>

Copy all three segments.

## 3. Create the new service from this repo, pointed at this subfolder

- In the same Railway project (not a new project): "+ New" -> "GitHub Repo"
  -> select the LookingForGroup repo.
- Once the service is created, open its Settings tab and set:
    Root Directory = containers/services/mysql-restart-cron
  This tells Railway to only pull/build files from this subfolder, as if
  the rest of the monorepo doesn't exist for this service. Railway will
  auto-detect the package.json here and build/run it via Nixpacks - no
  Dockerfile needed.
- Also worth setting a Watch Path of the same folder (a separate setting
  from Root Directory), so this service only redeploys when something in
  this folder changes - not on every unrelated push to client/ or server/
  elsewhere in the repo.
- Set the deploy branch to `main` (Settings -> Source -> branch), matching
  how the rest of production deploys.

## 4. Set the Variables on the NEW service (not on the MySQL service)

    RAILWAY_API_TOKEN     = (the token from step 1)
    TARGET_PROJECT_ID     = (from step 2)
    TARGET_SERVICE_ID     = (the MySQL service's ID, from step 2)
    TARGET_ENVIRONMENT_ID = (from step 2)

## 5. Set the cron schedule

On the new service: Settings -> Cron Schedule. Pick a low-traffic time,
e.g. 4:00 AM Eastern daily:

    0 8 * * *

(Railway cron schedules run in UTC - 8:00 UTC = 4:00 AM Eastern during EDT,
5:00 AM during EST. Double check against whichever is current when you set
this up.)

## 6. Verify it worked

- Check the new service's deployment logs after the first scheduled run -
  should show the three console.log lines from restart-mysql.js ending in
  "Restart triggered successfully."
- Check the MySQL service's own deploy history for a new restart entry at
  the same time.
- Check the Memory graph on the MySQL service over the following days to
  confirm it's resetting to a low baseline on schedule.

## Note

This script calls `deploymentRestart`, not `deploymentRedeploy` - it
restarts the existing running instance rather than rebuilding it from
scratch. This is faster and doesn't require a fresh image pull, which
matches the goal here (reset process memory, not deploy new code). It
does not touch the MySQL service's Volume - restarting the process has
no effect on the data files persisted there.
