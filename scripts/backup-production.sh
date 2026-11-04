#!/bin/sh
set -eu

project_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
backup_dir="${BACKUP_DIR:-$project_root/backups}"
retention_days="${RETENTION_DAYS:-30}"

case "$retention_days" in
  ''|*[!0-9]*) echo 'RETENTION_DAYS must be a positive whole number.' >&2; exit 2 ;;
esac
if [ "$retention_days" -lt 1 ]; then
  echo 'RETENTION_DAYS must be at least 1.' >&2
  exit 2
fi
if [ ! -f "$project_root/.env" ]; then
  echo 'Missing .env in the project directory.' >&2
  exit 2
fi

umask 077
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
backup_file="$backup_dir/aqua-atlas-$timestamp.dump"
temporary_file="$backup_file.tmp"
trap 'rm -f "$temporary_file"' EXIT HUP INT TERM

docker compose --env-file "$project_root/.env" -f "$project_root/compose.production.yaml" \
  exec -T database pg_dump --username=aqua_atlas --dbname=aqua_atlas --format=custom > "$temporary_file"
mv "$temporary_file" "$backup_file"

docker compose --env-file "$project_root/.env" -f "$project_root/compose.production.yaml" \
  exec -T database pg_restore --list < "$backup_file" >/dev/null
find "$backup_dir" -type f -name 'aqua-atlas-*.dump' -mtime "+$retention_days" -delete

trap - EXIT HUP INT TERM
printf 'Backup created and checked: %s\n' "$backup_file"
