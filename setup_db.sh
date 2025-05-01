#!/bin/bash

# Load config if .env exists
if [ -f ./backend/.env ]; then
  echo "✅ Found .env file in /backend. Using its values..."
  set -a
  source ./backend/.env
  set +a
else
  echo "⚠️  .env file not found. You can create one by copying .env.example to /backend/.env"
fi

# Prompt user if values are missing
read -p "Enter MySQL username [${DB_USER:-root}]: " input_user
DB_USER=${input_user:-$DB_USER}
DB_USER=${DB_USER:-root}

read -s -p "Enter MySQL password: " DB_PASS_INPUT
echo
DB_PASS=${DB_PASS_INPUT:-$DB_PASS}

read -p "Enter database name [${DB_NAME:-databased}]: " input_db
DB_NAME=${input_db:-$DB_NAME}
DB_NAME=${DB_NAME:-databased}

echo -e "\n🔧 Setting up database '$DB_NAME'..."

# Run schema + data
mysql --local-infile=1 -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < data/schema.sql || {
  echo "❌ Failed to run schema.sql. Make sure the database '$DB_NAME' exists."
  exit 1
}

mysql --local-infile=1 -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < data/load_mock_data.sql || {
  echo "❌ Failed to run load_mock_data.sql."
  exit 1
}

echo "✅ Database initialized successfully!"
