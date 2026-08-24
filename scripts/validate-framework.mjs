#!/usr/bin/env node
import { resolve } from "node:path";

import { validarFramework } from "./framework-catalog.mjs";

const raiz = resolve(process.argv[2] ?? process.cwd());
const problemas = validarFramework(raiz);

if (problemas.length > 0) {
  console.error(`Framework inválido (${problemas.length} problema(s)):`);
  for (const problema of problemas) console.error(`- ${problema}`);
  process.exitCode = 1;
} else {
  console.log("Framework válido: catálogo, manifesto, versões e invocação estão consistentes.");
}
