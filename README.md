# encfile

Simple CLI tool to encrypt and decrypt files with a password.

## Installation

```bash
npm install -g encfile
```

## Usage

### Encrypt a file

```bash
# Prompt for password
encfile encrypt data.csv

# Or provide password directly
encfile encrypt data.csv -p MyStrongPassword
```

### Decrypt a file

```bash
# Prompt for password
encfile decrypt data.csv.enc

# Or provide password directly
encfile decrypt data.csv.enc -p MyStrongPassword

# Optional: specify output file name
encfile decrypt data.csv.enc myfile.csv
```
