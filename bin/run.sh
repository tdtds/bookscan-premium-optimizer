#!/usr/bin/env bash
npm run production
bundle exec thin start -p $PORT
