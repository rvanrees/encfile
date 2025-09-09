#!/usr/bin/env node

import * as fs from "fs";
import * as crypto from "crypto";
import { Command } from "commander";
import readlineSync from "readline-sync";

const program = new Command();

/**
 * Derive a 32-byte key from password and salt using PBKDF2
 */
function getKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 390_000, 32, "sha256");
}

/**
 * Encrypt a file and save as <file>.enc
 */
function encryptFile(input: string, password: string) {
  const salt = crypto.randomBytes(16);
  const key = getKeyFromPassword(password, salt);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const data = fs.readFileSync(input);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const result = Buffer.concat([salt, iv, encrypted]);

  const output = input + ".enc";
  fs.writeFileSync(output, result);

  console.log(`✅ Encrypted ${input} -> ${output}`);
}

/**
 * Decrypt a file
 */
function decryptFile(input: string, output: string, password: string) {
  const content = fs.readFileSync(input);

  const salt = content.subarray(0, 16);
  const iv = content.subarray(16, 32);
  const encrypted = content.subarray(32);

  const key = getKeyFromPassword(password, salt);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  fs.writeFileSync(output, decrypted);

  console.log(`✅ Decrypted ${input} -> ${output}`);
}

/**
 * Get password from CLI option or prompt securely
 */
function getPassword(optionPassword?: string): string {
  if (optionPassword) return optionPassword;

  return readlineSync.question("Password: ", {
    hideEchoBack: true, // input wordt verborgen
  });
}

/**
 * CLI commands
 */
program
  .command("encrypt <input>")
  .option("-p, --password <password>", "Password for encryption")
  .description("Encrypt a file into <file>.enc using a password")
  .action((input, options) => {
    const password = getPassword(options.password);
    encryptFile(input, password);
  });

program
  .command("decrypt <input> [output]")
  .option("-p, --password <password>", "Password for decryption")
  .description("Decrypt a .enc file back to original")
  .action((input, output, options) => {
    const password = getPassword(options.password);

    // default output = input without .enc
    const finalOutput = output || input.replace(/\.enc$/, "");

    decryptFile(input, finalOutput, password);
  });

program.parse(process.argv);
