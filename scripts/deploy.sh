#!/bin/bash

aws s3 sync dist/ s3://const.sh --profile const.sh --region "eu-central-1"
aws cloudfront create-invalidation --distribution-id E2GYU54JQ5UGHQ --paths '/*' --profile const.sh --region "eu-central-1"
