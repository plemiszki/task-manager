#!/bin/bash

if [ -f latest.dump ]; then
  rm latest.dump
fi

heroku pg:backups:capture --app task-mngr
heroku pg:backups:download --app task-mngr

pg_restore --verbose --clean --no-acl --no-owner -h localhost -d task-manager_development latest.dump
rm latest.dump

echo Production Database Imported!
