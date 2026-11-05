# TNC Blue Carbon Cost Tool

## Run locally

For the local `staging` workflow, run the API, client, and backoffice in three
separate terminals, with only Postgres and MinIO running in Docker.

From the repository root, install dependencies once (and again after dependency
changes):

```sh
pnpm install
```

Each time you start the local app, make sure you are on `staging` and start the
supporting services:

```sh
git switch staging
docker compose up -d database minio
```

The Compose database is available on host port `5434` (container port `5432`).
Start each application in its own terminal, from the repository root:

**Terminal 1 — API**

```sh
DB_PORT=5434 DB_SYNCHRONIZE=false pnpm api:dev
```

`DB_SYNCHRONIZE=false` prevents TypeORM from attempting to alter database
columns used by existing views.

**Terminal 2 — client**

```sh
pnpm client:dev
```

The client development environment should use `NEXTAUTH_URL=http://localhost:3000/auth/api`
and `NEXT_PUBLIC_API_URL=http://localhost:4000`.

**Terminal 3 — backoffice**

Build the backoffice image on first use and after dependency changes:

```sh
docker compose build backoffice
```

Then start the backoffice:

```sh
docker compose run --rm --service-ports \
  -e API_URL=http://host.docker.internal:4000 \
  backoffice pnpm --filter backoffice run start:dev
```

Backoffice, API, and shared TypeScript source files are mounted into the
container and watched by nodemon, so code changes reload automatically without
rebuilding or restarting the backoffice.

Open the apps at:

- Client: <http://localhost:3000>
- Backoffice: <http://localhost:1000/admin/login>
- MinIO console: <http://localhost:9001>

The Admin link in the local client opens the backoffice. The client and
backoffice use the same account credentials, but require separate sign-ins.
When finished, stop the application processes with `Ctrl+C`; stop Postgres and
MinIO without removing their containers using:

```sh
docker compose stop database minio
```

## Methodology

### Sources

**This section explains how the table of model components and their sources is rendered in the methodology page.**

The methodology sources implementation is somewhat tricky due to a series of decisions influenced by limiting factors, such as the integration between AdminJS (UI and entity management) and the API entities, along with various trade-offs.

> **Note:** AdminJS's `position: number` property, which determines field order, does not work as expected. Instead, we use `listProperties`, `showProperties`, and `editProperties` for ordering.

---

## Configuration

Configuration is managed in:

```
api/src/modules/methodology/methodology.config.ts
```

This file contains all the entities that appear in the table. There are two types of relationships:

### 1-to-N (`1n`)

Entities in which each row can be related to **one and only one** source.

#### How to Add a New Entity with a 1n Relationship to `ModelComponentSource`

1. Define the `@ManyToOne` and `@OneToMany` TypeORM relationships between your entity and `ModelComponentSource` (use string-based references instead of anonymous functions for AdminJS compatibility).
2. Add the new entity to the configuration file:  
   ```
   api/src/modules/methodology/methodology.config.ts
   ```

---

### Many-to-Many (`m2m`)

Entities in which rows can have multiple columns, each related to different sources.

#### How to Add a New Entity with an `m2m` Relationship to `ModelComponentSource`

1. Import and add the following actions to an AdminJS resource options:

    ```typescript
    properties: {
        sources: {
            isVisible: { show: true, edit: true, list: true, filter: false },
            components: {
                list: Components.Many2ManySources,
                show: Components.Many2ManySources,
                edit: Components.Many2ManySources,
            },
        }
    },
    actions: {
        fetchRelatedSourcesAction: {
            actionType: 'record',
            isVisible: false,
            handler: fetchRelatedSourcesActionHandler,
        },
        addSourceAction: {
            actionType: 'record',
            isVisible: false,
            handler: addSourceActionHandler,
        },
        deleteSourceAction: {
            actionType: 'record',
            isVisible: false,
            handler: deleteSourceActionHandler,
        },
        fetchAvailableSourceTypesAction: {
            actionType: 'record',
            isVisible: false,
            handler: fetchAvailableSourceTypesActionHandler,
        }
    }
    ```

2. Add the new entity to the configuration file:  
   ```
   api/src/modules/methodology/methodology.config.ts
   ```

---

### Notes

- Always ensure AdminJS compatibility by using **string-based** references in TypeORM relationships.
-  Field ordering on AdminJS does not work as expected, rely on `listProperties`, `showProperties`, and `editProperties` to order fields in the different views.
