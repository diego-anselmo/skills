import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const BUCKETS_PUBLICOS = ["engineering", "productivity", "misc"];
const REPOSITORIO = "https://github.com/diego-anselmo/skills";

function caminhoPosix(caminho) {
  return caminho.split(sep).join("/");
}

function lerJson(caminho, problemas) {
  try {
    return JSON.parse(readFileSync(caminho, "utf8"));
  } catch (erro) {
    problemas.push(`${caminho}: JSON inválido (${erro.message})`);
    return null;
  }
}

function listarSkillsPublicas(raiz) {
  const skills = [];
  for (const bucket of BUCKETS_PUBLICOS) {
    const diretorio = join(raiz, "skills", bucket);
    if (!existsSync(diretorio)) continue;
    for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      const skillMd = join(diretorio, entrada.name, "SKILL.md");
      if (!existsSync(skillMd)) continue;
      skills.push({
        bucket,
        nome: entrada.name,
        caminho: `./skills/${bucket}/${entrada.name}`,
        skillMd,
      });
    }
  }
  return skills.sort((a, b) => a.caminho.localeCompare(b.caminho));
}

function nomeFrontmatter(conteudo) {
  const bloco = conteudo.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!bloco) return null;
  const nome = bloco[1].match(/^name:\s*['"]?([^'"\r\n]+)['"]?\s*$/m);
  return nome?.[1]?.trim() ?? null;
}

export function validarFramework(raiz) {
  const problemas = [];
  const caminhoManifesto = join(raiz, ".claude-plugin", "plugin.json");
  const caminhoPacote = join(raiz, "package.json");
  const caminhoReadme = join(raiz, "README.md");
  const manifesto = lerJson(caminhoManifesto, problemas);
  const pacote = lerJson(caminhoPacote, problemas);
  if (!manifesto || !pacote || !existsSync(caminhoReadme)) {
    if (!existsSync(caminhoReadme)) problemas.push("README.md: arquivo obrigatório ausente");
    return problemas;
  }

  if (manifesto.name !== "diego-anselmo-skills") {
    problemas.push(`plugin.json: name deve ser diego-anselmo-skills, recebido ${manifesto.name}`);
  }
  if (pacote.name !== "diego-anselmo-skills") {
    problemas.push(`package.json: name deve ser diego-anselmo-skills, recebido ${pacote.name}`);
  }
  if (manifesto.version !== pacote.version) {
    problemas.push(`versão divergente: plugin=${manifesto.version} package=${pacote.version}`);
  }
  if (manifesto.repository !== REPOSITORIO) {
    problemas.push(`plugin.json: repository deve ser ${REPOSITORIO}`);
  }
  const caminhoInstalador = join(raiz, "scripts", "setup-diego-anselmo-skills.sh");
  if (!existsSync(caminhoInstalador)) {
    problemas.push("scripts/setup-diego-anselmo-skills.sh: instalador canônico ausente");
  } else {
    const conteudoInstalador = readFileSync(caminhoInstalador, "utf8");
    const origemInstalador = conteudoInstalador.match(/^FRAMEWORK_SOURCE=["']([^"']+)["']$/m)?.[1];
    const versaoInstalador = conteudoInstalador.match(/^FRAMEWORK_VERSION=["']([^"']+)["']$/m)?.[1];
    if (origemInstalador !== "diego-anselmo/skills") {
      problemas.push(`origem divergente: instalador=${origemInstalador} esperado=diego-anselmo/skills`);
    }
    if (versaoInstalador !== pacote.version) {
      problemas.push(`versão divergente: instalador=${versaoInstalador} package=${pacote.version}`);
    }
  }

  const publicas = listarSkillsPublicas(raiz);
  const caminhosPublicos = new Set(publicas.map((skill) => skill.caminho));
  const caminhosManifesto = new Set(Array.isArray(manifesto.skills) ? manifesto.skills : []);
  if (!Array.isArray(manifesto.skills)) problemas.push("plugin.json: skills deve ser um array");

  for (const skill of publicas) {
    if (!caminhosManifesto.has(skill.caminho)) {
      problemas.push(`${skill.caminho}: skill pública ausente do plugin.json`);
    }
    const conteudoSkill = readFileSync(skill.skillMd, "utf8");
    const nome = nomeFrontmatter(conteudoSkill);
    if (nome !== skill.nome) {
      problemas.push(`${caminhoPosix(relative(raiz, skill.skillMd))}: name '${nome}' difere da pasta '${skill.nome}'`);
    }

    const metadataCodex = join(dirname(skill.skillMd), "agents", "openai.yaml");
    const somenteUsuario = /^disable-model-invocation:\s*true\s*$/m.test(conteudoSkill);
    const codexBloqueiaImplicita =
      existsSync(metadataCodex) && /^(\s*)allow_implicit_invocation:\s*false\s*$/m.test(readFileSync(metadataCodex, "utf8"));
    if (somenteUsuario && !codexBloqueiaImplicita) {
      problemas.push(
        `${skill.caminho}: disable-model-invocation exige agents/openai.yaml com allow_implicit_invocation: false`,
      );
    }
    if (!somenteUsuario && codexBloqueiaImplicita) {
      problemas.push(`${skill.caminho}: agents/openai.yaml bloqueia invocacao implicita sem frontmatter equivalente`);
    }
  }

  for (const caminho of caminhosManifesto) {
    if (!caminhosPublicos.has(caminho)) {
      problemas.push(`${caminho}: entrada do plugin.json não corresponde a uma skill pública`);
    }
  }

  const nomes = new Map();
  for (const skill of publicas) {
    const anterior = nomes.get(skill.nome);
    if (anterior) problemas.push(`nome duplicado '${skill.nome}': ${anterior} e ${skill.caminho}`);
    nomes.set(skill.nome, skill.caminho);
  }

  const readme = readFileSync(caminhoReadme, "utf8");
  const referencias = new Set(
    [...readme.matchAll(/\.\/skills\/(engineering|productivity|misc)\/([^/)]+)\/SKILL\.md/g)].map(
      ([, bucket, nome]) => `./skills/${bucket}/${nome}`,
    ),
  );
  for (const skill of publicas) {
    if (!referencias.has(skill.caminho)) problemas.push(`${skill.caminho}: referência ausente do README.md`);
  }
  for (const referencia of referencias) {
    if (!caminhosPublicos.has(referencia)) problemas.push(`${referencia}: referência obsoleta no README.md`);
  }

  return problemas;
}
