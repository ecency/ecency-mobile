#!/bin/bash

# Path to .env and .env.example files
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE does not exist. Please create it first."
  exit 1
fi

# Regenerate .env.example
echo "Syncing $ENV_EXAMPLE_FILE..."
> "$ENV_EXAMPLE_FILE"  # Clear the file or create it if it doesn't exist

while IFS= read -r line || [ -n "$line" ]; do
  # Extract the key before '=' and skip empty/commented lines
  key=$(echo "$line" | cut -d'=' -f1)
  if [ -n "$key" ] && [ "${key:0:1}" != "#" ]; then
    echo "$key=" >> "$ENV_EXAMPLE_FILE"
  fi
done < "$ENV_FILE"

echo "$ENV_EXAMPLE_FILE synced successfully."
