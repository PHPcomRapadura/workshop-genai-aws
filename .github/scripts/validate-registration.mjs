import fs from "node:fs";

const [basePath, headPath] = process.argv.slice(2);

if (!basePath || !headPath) {
  throw new Error("Informe os arquivos da lista atual e da lista proposta.");
}

const normalize = (value) => value.replace(/\r\n/g, "\n");
const base = normalize(fs.readFileSync(basePath, "utf8"));
const head = normalize(fs.readFileSync(headPath, "utf8"));
const baseLines = base.split("\n");
const headLines = head.split("\n");

if (headLines.length !== baseLines.length + 1) {
  throw new Error("O PR deve adicionar exatamente uma linha.");
}

let insertedIndex = -1;
let baseIndex = 0;

for (let headIndex = 0; headIndex < headLines.length; headIndex += 1) {
  if (baseIndex < baseLines.length && headLines[headIndex] === baseLines[baseIndex]) {
    baseIndex += 1;
    continue;
  }

  if (insertedIndex !== -1) {
    throw new Error("O PR não pode alterar ou remover conteúdo existente.");
  }

  insertedIndex = headIndex;
}

if (baseIndex !== baseLines.length || insertedIndex !== headLines.length - 2) {
  throw new Error("Adicione o contato somente ao final da tabela.");
}

const row = headLines[insertedIndex];
const emailPattern = /^\|\s*([a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)\s*\|$/i;
const telegramPattern = /^\|\s*(@[a-z0-9_]{5,32})\s*\|$/i;
const match = row.match(emailPattern) ?? row.match(telegramPattern);

if (!match || match[1].length > 254) {
  throw new Error("Use | seu-email@exemplo.com | ou | @seu_usuario |.");
}

const contact = match[1].toLowerCase();
const currentContacts = baseLines
  .map((line) => (line.match(emailPattern) ?? line.match(telegramPattern))?.[1]?.toLowerCase())
  .filter(Boolean);

if (new Set(currentContacts).size !== currentContacts.length) {
  throw new Error("A lista atual contém contatos duplicados.");
}

if (currentContacts.length >= 10) {
  throw new Error("As 10 vagas já foram preenchidas.");
}

if (currentContacts.includes(contact)) {
  throw new Error("Este contato já está inscrito.");
}

process.stdout.write(`Inscrição válida para a vaga ${currentContacts.length + 1} de 10.\n`);
