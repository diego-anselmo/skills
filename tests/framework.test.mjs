import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { validarFramework } from "../scripts/framework-catalog.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function escrever(caminho, conteudo) {
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, conteudo);
}

function criarFixtureValida() {
  const fixture = mkdtempSync(join(tmpdir(), "skills-catalog-"));
  escrever(join(fixture, "package.json"), JSON.stringify({ name: "diego-anselmo-skills", version: "1.0.0" }));
  escrever(
    join(fixture, ".claude-plugin", "plugin.json"),
    JSON.stringify({
      name: "diego-anselmo-skills",
      version: "1.0.0",
      repository: "https://github.com/diego-anselmo/skills",
      skills: ["./skills/engineering/alpha", "./skills/productivity/beta", "./skills/misc/gamma"],
    }),
  );
  escrever(join(fixture, "skills", "engineering", "alpha", "SKILL.md"), "---\nname: alpha\ndescription: Alpha.\n---\n");
  escrever(join(fixture, "skills", "productivity", "beta", "SKILL.md"), "---\nname: beta\ndescription: Beta.\n---\n");
  escrever(join(fixture, "skills", "misc", "gamma", "SKILL.md"), "---\nname: gamma\ndescription: Gamma.\n---\n");
  escrever(join(fixture, "skills", "personal", "segredo", "SKILL.md"), "---\nname: segredo\ndescription: Privada.\n---\n");
  escrever(
    join(fixture, "README.md"),
    "[`/alpha`](./skills/engineering/alpha/SKILL.md)\n[`/beta`](./skills/productivity/beta/SKILL.md)\n[`/gamma`](./skills/misc/gamma/SKILL.md)\n",
  );
  escrever(
    join(fixture, "scripts", "setup-diego-anselmo-skills.sh"),
    "#!/usr/bin/env bash\nFRAMEWORK_SOURCE=\"diego-anselmo/skills\"\nFRAMEWORK_VERSION=\"1.0.0\"\n",
  );
  return fixture;
}

test("aceita um catálogo público completo e versionado", () => {
  const fixture = criarFixtureValida();
  assert.deepEqual(validarFramework(fixture), []);
});

test("detecta divergência entre versão do instalador e do pacote", () => {
  const fixture = criarFixtureValida();
  escrever(
    join(fixture, "scripts", "setup-diego-anselmo-skills.sh"),
    "#!/usr/bin/env bash\nFRAMEWORK_SOURCE=\"diego-anselmo/skills\"\nFRAMEWORK_VERSION=\"9.9.9\"\n",
  );

  const problemas = validarFramework(fixture);
  assert(problemas.some((problema) => problema.includes("instalador=9.9.9")));
});

test("detecta origem operacional divergente no instalador", () => {
  const fixture = criarFixtureValida();
  escrever(
    join(fixture, "scripts", "setup-diego-anselmo-skills.sh"),
    "#!/usr/bin/env bash\nFRAMEWORK_SOURCE=\"outra/origem\"\nFRAMEWORK_VERSION=\"1.0.0\"\n",
  );

  const problemas = validarFramework(fixture);
  assert(problemas.some((problema) => problema.includes("instalador=outra/origem")));
});

test("detecta skill pública ausente do manifesto e referência obsoleta", () => {
  const fixture = criarFixtureValida();
  const manifesto = JSON.parse(readFileSync(join(fixture, ".claude-plugin", "plugin.json"), "utf8"));
  manifesto.skills = manifesto.skills.filter((item) => !item.endsWith("/beta"));
  escrever(join(fixture, ".claude-plugin", "plugin.json"), JSON.stringify(manifesto));
  escrever(
    join(fixture, "README.md"),
    `${readFileSync(join(fixture, "README.md"), "utf8")}[\`/fantasma\`](./skills/engineering/fantasma/SKILL.md)\n`,
  );

  const problemas = validarFramework(fixture);
  assert(problemas.some((problema) => problema.includes("productivity/beta")));
  assert(problemas.some((problema) => problema.includes("fantasma")));
});

test("exige metadata Codex pareada para skill somente do usuário", () => {
  const fixture = criarFixtureValida();
  escrever(
    join(fixture, "skills", "engineering", "alpha", "SKILL.md"),
    "---\nname: alpha\ndescription: Alpha.\ndisable-model-invocation: true\n---\n",
  );

  const problemas = validarFramework(fixture);
  assert(problemas.some((problema) => problema.includes("agents/openai.yaml")));
});

test("o próprio repositório satisfaz o contrato público", () => {
  assert.deepEqual(validarFramework(raiz), []);
});

test("instalação por stdin copia skills, registra proveniência e preserva conteúdo anterior", () => {
  const destino = mkdtempSync(join(tmpdir(), "skills-install-"));
  const diagnostico = join(destino, "diagnose");
  mkdirSync(diagnostico);
  escrever(join(diagnostico, "usuario.txt"), "preservar");

  const instalador = readFileSync(join(raiz, "scripts", "setup-diego-anselmo-skills.sh"), "utf8");
  execFileSync("bash", ["-s", "--", "--redeploy", destino], {
    cwd: raiz,
    env: {
      ...process.env,
      SKILLS_FRAMEWORK_ROOT: raiz,
      SKILLS_FRAMEWORK_COMMIT: "abcdef1234567890",
      SKILLS_FRAMEWORK_REF: "main",
    },
    input: instalador,
    stdio: ["pipe", "pipe", "pipe"],
  });

  const skillInstalada = join(destino, "orchestrator", "SKILL.md");
  assert(existsSync(skillInstalada));
  assert.equal(lstatSync(join(destino, "orchestrator")).isSymbolicLink(), false);
  assert(existsSync(join(destino, "orchestrator", ".diego-anselmo-managed")));

  const metadados = JSON.parse(readFileSync(join(destino, ".diego-anselmo-skills.json"), "utf8"));
  assert.equal(metadados.source, "diego-anselmo/skills");
  assert.equal(metadados.ref, "main");
  assert.equal(metadados.commit, "abcdef1234567890");
  assert.equal(metadados.version, JSON.parse(readFileSync(join(raiz, "package.json"), "utf8")).version);

  const backupsAntes = readdirSync(destino).filter((nome) => nome.startsWith("diagnose.backup."));
  assert.equal(backupsAntes.length, 1);
  assert(existsSync(join(destino, backupsAntes[0], "usuario.txt")));
  escrever(join(destino, "skill-obsoleta", ".diego-anselmo-managed"), "source=diego-anselmo/skills\n");
  escrever(join(destino, "skill-obsoleta", "SKILL.md"), "obsoleta");

  execFileSync("bash", [join(raiz, "scripts", "setup-diego-anselmo-skills.sh"), "--redeploy", destino], {
    cwd: raiz,
    env: {
      ...process.env,
      SKILLS_FRAMEWORK_ROOT: raiz,
      SKILLS_FRAMEWORK_COMMIT: "abcdef1234567890",
      SKILLS_FRAMEWORK_REF: "main",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const backupsDepois = readdirSync(destino).filter((nome) => nome.startsWith("diagnose.backup."));
  assert.equal(backupsDepois.length, 1);
  assert.equal(existsSync(join(destino, "skill-obsoleta")), false);
});

test("bootstrap repara cache parcial antes de instalar", () => {
  const temporario = mkdtempSync(join(tmpdir(), "skills-bootstrap-"));
  const pacote = join(temporario, "pacote", "diego-skills-test");
  const cache = join(temporario, "cache");
  const commit = "cacheparcial123";
  const destino = join(temporario, "destino");
  const instalador = readFileSync(join(raiz, "scripts", "setup-diego-anselmo-skills.sh"), "utf8");

  escrever(
    join(pacote, ".claude-plugin", "plugin.json"),
    JSON.stringify({ skills: ["./skills/engineering/alpha"] }),
  );
  escrever(join(pacote, "skills", "engineering", "alpha", "SKILL.md"), "---\nname: alpha\ndescription: Alpha.\n---\n");
  escrever(join(pacote, "scripts", "setup-diego-anselmo-skills.sh"), instalador);
  escrever(join(cache, commit, "download-interrompido"), "parcial");

  const arquivo = join(temporario, "framework.tar.gz");
  execFileSync("tar", ["-czf", arquivo, "-C", join(temporario, "pacote"), "diego-skills-test"]);

  execFileSync("bash", ["-s", "--", "--redeploy", destino], {
    cwd: raiz,
    env: {
      ...process.env,
      SKILLS_FRAMEWORK_ROOT: "",
      SKILLS_FRAMEWORK_COMMIT: commit,
      SKILLS_FRAMEWORK_REF: "main",
      SKILLS_FRAMEWORK_CACHE_DIR: cache,
      SKILLS_FRAMEWORK_ARCHIVE_URL: pathToFileURL(arquivo).href,
    },
    input: instalador,
    stdio: ["pipe", "pipe", "pipe"],
  });

  assert(existsSync(join(cache, commit, ".claude-plugin", "plugin.json")));
  assert(existsSync(join(destino, "alpha", "SKILL.md")));
  const metadados = JSON.parse(readFileSync(join(destino, ".diego-anselmo-skills.json"), "utf8"));
  assert.equal(metadados.commit, commit);
});
