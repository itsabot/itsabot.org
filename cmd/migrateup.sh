#!/usr/bin/env bash

set -e

ls db/migrations/up/*.sql | xargs -I{} -- psql -U postgres itsabot -h localhost -f {}
