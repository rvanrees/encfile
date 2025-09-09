# encfile-cli

Encrypt and decrypt files securely with a password, fast and simple.

## Installation

```bash
npm install -g encfile-cli
```

## Usage

### Encrypt a file

```bash
# Prompt for password
encfile-cli encrypt data.csv

# Or provide password directly
encfile-cli encrypt data.csv -p MyStrongPassword
```

### Decrypt a file

```bash
# Prompt for password
encfile-cli decrypt data.csv.enc

# Or provide password directly
encfile-cli decrypt data.csv.enc -p MyStrongPassword

# Optional: specify output file name
encfile-cli decrypt data.csv.enc myfile.csv
```
