#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const commander_1 = require("commander");
const readline_sync_1 = __importDefault(require("readline-sync"));
const program = new commander_1.Command();
/**
 * Derive a 32-byte key from password and salt using PBKDF2
 */
function getKeyFromPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 390000, 32, "sha256");
}
/**
 * Encrypt a file and save as <file>.enc
 */
function encryptFile(input, password) {
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
function decryptFile(input, output, password) {
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
function getPassword(optionPassword) {
    if (optionPassword)
        return optionPassword;
    return readline_sync_1.default.question("Password: ", {
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
