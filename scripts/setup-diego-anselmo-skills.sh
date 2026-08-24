#!/usr/bin/env bash
set -euo pipefail

FRAMEWORK_SOURCE="diego-anselmo/skills"
FRAMEWORK_REPOSITORY="https://github.com/$FRAMEWORK_SOURCE"
FRAMEWORK_GIT_URL="$FRAMEWORK_REPOSITORY.git"
FRAMEWORK_VERSION="1.0.0"
FRAMEWORK_REF="${SKILLS_FRAMEWORK_REF:-main}"
SCRIPT_PATH="${BASH_SOURCE[0]:-}"

if [[ -n "${SKILLS_FRAMEWORK_ROOT:-}" ]]; then
  REPO="$(cd "$SKILLS_FRAMEWORK_ROOT" 2>/dev/null && pwd || true)"
elif [[ -n "$SCRIPT_PATH" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" 2>/dev/null && pwd || true)"
  REPO="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd || true)"
else
  REPO=""
fi

resolve_remote_commit() {
  if [[ -n "${SKILLS_FRAMEWORK_COMMIT:-}" ]]; then
    printf '%s\n' "$SKILLS_FRAMEWORK_COMMIT"
    return
  fi

  command -v git >/dev/null || {
    echo "Erro: git e necessario para resolver a revisao do framework." >&2
    return 1
  }

  local refs
  refs="$(git ls-remote "$FRAMEWORK_GIT_URL" \
    "refs/heads/$FRAMEWORK_REF" "refs/tags/$FRAMEWORK_REF" "$FRAMEWORK_REF" 2>/dev/null || true)"
  [[ -n "$refs" ]] || {
    echo "Erro: nao foi possivel resolver '$FRAMEWORK_REF' em $FRAMEWORK_SOURCE." >&2
    return 1
  }
  printf '%s\n' "$refs" | sed -n '1{s/[[:space:]].*//;p;}'
}

resolve_installed_commit() {
  if [[ -n "${SKILLS_FRAMEWORK_COMMIT:-}" ]]; then
    printf '%s\n' "$SKILLS_FRAMEWORK_COMMIT"
  elif git -C "$REPO" rev-parse HEAD >/dev/null 2>&1; then
    git -C "$REPO" rev-parse HEAD
  else
    resolve_remote_commit
  fi
}

prompt_read() {
  local prompt="$1"
  local variable="$2"
  if [[ ! -t 0 ]] && { true </dev/tty; } 2>/dev/null; then
    read -r -p "$prompt" "$variable" </dev/tty
  else
    read -r -p "$prompt" "$variable"
  fi
}

# A execucao via curl guarda uma copia imutavel por commit. Nenhum link aponta para mktemp.
if [[ ! -f "$REPO/.claude-plugin/plugin.json" ]]; then
  if [[ "${FRAMEWORK_BOOTSTRAPPED:-}" == "1" ]]; then
    echo "Erro: nao foi possivel localizar o framework em '$REPO'." >&2
    exit 1
  fi

  command -v curl >/dev/null || { echo "Erro: curl e necessario para instalacao sem clone." >&2; exit 1; }
  command -v tar >/dev/null || { echo "Erro: tar e necessario para instalacao sem clone." >&2; exit 1; }

  commit="$(resolve_remote_commit)"
  cache_root="${SKILLS_FRAMEWORK_CACHE_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/diego-anselmo-skills}"
  cache_dir="$cache_root/$commit"

  if [[ ! -f "$cache_dir/.claude-plugin/plugin.json" ]]; then
    staging="$cache_root/.staging-$commit-$$"
    rm -rf "$staging"
    mkdir -p "$staging"
    cleanup_staging() { rm -rf "$staging"; }
    trap cleanup_staging EXIT
    archive_url="${SKILLS_FRAMEWORK_ARCHIVE_URL:-$FRAMEWORK_REPOSITORY/archive/$commit.tar.gz}"
    curl -fsSL "$archive_url" | tar -xz -C "$staging" --strip-components=1
    if [[ -d "$cache_dir" ]]; then
      rm -rf "$staging"
    else
      mv "$staging" "$cache_dir"
    fi
    trap - EXIT
  fi

  export FRAMEWORK_BOOTSTRAPPED=1
  export SKILLS_FRAMEWORK_ROOT="$cache_dir"
  export SKILLS_FRAMEWORK_COMMIT="$commit"
  export SKILLS_FRAMEWORK_REF="$FRAMEWORK_REF"
  exec bash "$cache_dir/scripts/setup-diego-anselmo-skills.sh" "$@"
fi

declare -a DESTS=()
REDEPLOY=false

if [[ "${1:-}" == "--redeploy" ]]; then
  REDEPLOY=true
  shift
  if [[ $# -gt 0 ]]; then
    DESTS=("$@")
  else
    for candidate in \
      "${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}" \
      "${CODEX_SKILLS_DIR:-$HOME/.codex/skills}" \
      "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}" \
      "${HERMES_SKILLS_DIR:-$HOME/.hermes/skills}"; do
      [[ -d "$candidate" ]] && DESTS+=("$candidate")
    done
  fi
elif [[ "${1:-}" == "--dest" ]]; then
  while [[ "${1:-}" == "--dest" ]]; do
    shift
    [[ $# -gt 0 ]] || { echo "Erro: --dest exige um caminho." >&2; exit 1; }
    DESTS+=("${1/#\~/$HOME}")
    shift
  done
  [[ $# -eq 0 ]] || { echo "Erro: argumento inesperado '$1'." >&2; exit 1; }
else
  if [[ -n "${SKILLS_ENVIRONMENTS:-}" ]]; then
    choices="$SKILLS_ENVIRONMENTS"
  elif [[ $# -gt 0 ]]; then
    choices="$*"
  else
    echo "Instalacao das skills do framework"
    echo "Selecione um ou mais ambientes separados por espaco:"
    echo "  1) Codex     (~/.codex/skills)"
    echo "  2) Claude    (~/.claude/skills)"
    echo "  3) Hermes    (~/.hermes/skills)"
    echo "  4) Outro     (informar caminho)"
    prompt_read "Ambientes [1 2 3]: " choices || {
      echo "Erro: entrada interativa indisponivel. Use SKILLS_ENVIRONMENTS ou --dest." >&2
      exit 1
    }
  fi

  for choice in $choices; do
    case "$choice" in
      1) DESTS+=("${CODEX_SKILLS_DIR:-$HOME/.codex/skills}") ;;
      2) DESTS+=("${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}") ;;
      3) DESTS+=("${HERMES_SKILLS_DIR:-$HOME/.hermes/skills}") ;;
      4)
        if [[ -n "${SKILLS_CUSTOM_DIR:-}" ]]; then
          custom="$SKILLS_CUSTOM_DIR"
        else
          prompt_read "Caminho da pasta de skills: " custom || {
            echo "Erro: informe SKILLS_CUSTOM_DIR para instalacao nao interativa." >&2
            exit 1
          }
        fi
        [[ -n "$custom" ]] || { echo "Erro: caminho vazio." >&2; exit 1; }
        DESTS+=("${custom/#\~/$HOME}")
        ;;
      *) echo "Erro: opcao invalida '$choice'." >&2; exit 1 ;;
    esac
  done
fi

[[ ${#DESTS[@]} -gt 0 ]] || {
  if [[ "$REDEPLOY" == true ]]; then
    echo "Erro: nenhum ambiente instalado foi encontrado. Informe os destinos apos --redeploy." >&2
  else
    echo "Erro: nenhum ambiente selecionado." >&2
  fi
  exit 1
}

declare -a SKILL_DIRS=()
while IFS= read -r relative_skill; do
  [[ -n "$relative_skill" ]] && SKILL_DIRS+=("$REPO/${relative_skill#./}")
done < <(sed -n 's/^[[:space:]]*"\(\.\/skills\/[^"]*\)"[,]*/\1/p' "$REPO/.claude-plugin/plugin.json")

[[ ${#SKILL_DIRS[@]} -gt 0 ]] || {
  echo "Erro: o manifesto nao contem skills publicas." >&2
  exit 1
}

commit="$(resolve_installed_commit)"
installed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
backup_stamp="$(date +%Y%m%d%H%M%S)"

for dest in "${DESTS[@]}"; do
  mkdir -p "$dest"
  echo "Instalando em: $dest"
  for src in "${SKILL_DIRS[@]}"; do
    [[ -f "$src/SKILL.md" ]] || { echo "Erro: skill declarada sem SKILL.md: $src" >&2; exit 1; }
    name="$(basename "$src")"
    target="$dest/$name"
    if [[ -L "$target" ]]; then
      rm "$target"
    elif [[ -e "$target" ]]; then
      if [[ -f "$target/.diego-anselmo-managed" ]]; then
        rm -rf "$target"
      else
        backup="$target.backup.$backup_stamp"
        mv "$target" "$backup"
        echo "  backup: $backup"
      fi
    fi
    cp -R "$src" "$target"
    cat >"$target/.diego-anselmo-managed" <<EOF
source=$FRAMEWORK_SOURCE
ref=$FRAMEWORK_REF
commit=$commit
EOF
    echo "  ok: $name"
  done

  cat >"$dest/.diego-anselmo-skills.json" <<EOF
{
  "source": "$FRAMEWORK_SOURCE",
  "repository": "$FRAMEWORK_REPOSITORY",
  "ref": "$FRAMEWORK_REF",
  "commit": "$commit",
  "version": "$FRAMEWORK_VERSION",
  "installedAt": "$installed_at",
  "installMode": "copy"
}
EOF
done

if [[ "$REDEPLOY" == true ]]; then
  echo "Re-deploy concluido nos ambientes detectados."
else
  echo "Instalacao concluida. As skills foram copiadas e registradas com a revisao exata."
fi
