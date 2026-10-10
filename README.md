# 🛡️ DocShield — Secure Digital Document Locker

**DocShield** is a secure digital document locker designed to protect personal documents through client-side encryption and automated metadata indexing. It helps users organize, categorize, search, and manage digital documents through a simple, user-friendly interface.

## ✨ Features

- **Client-Side Encryption:** Encrypt documents in the browser using AES-256-GCM.
- **Password-Based Key Derivation:** Uses PBKDF2 to derive encryption keys.
- **Document Fingerprinting:** Generates SHA-256 fingerprints for document integrity verification.
- **Virtual Folder Management:** Organize documents into folders for easier access.
- **Automated Metadata Indexing:** Extract and categorize document metadata based on filenames.
- **Smart Categorization:** Classify documents into categories such as Identity, Education, Income, Community, and Other.
- **Search and Filtering:** Find documents using available search and category filters.
- **Document Management:** Seal, organize, retrieve, and manage documents through the application interface.
- **Responsive Interface:** Built with modern frontend technologies for a clean user experience.

## 🧰 Tech Stack

- **Frontend:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Programming Language:** JavaScript
- **Cryptography:** Web Crypto API
- **Storage:** Browser LocalStorage for application records and metadata

## 🏗️ Project Structure

```text
DocShield/
└── zk-locker/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── utils/
    │       ├── crypto.js
    │       └── metadata.js
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

*The directory structure may vary slightly depending on the current version of the project.*

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Kavishwetha07/DocShield.git
cd DocShield/zk-locker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔐 Security Approach

DocShield uses browser-side cryptographic operations to protect document contents.

- AES-256-GCM provides authenticated encryption.
- PBKDF2 derives an encryption key from a user-provided passphrase.
- A unique salt and initialization vector should be used according to the encryption implementation.
- SHA-256 fingerprints can help identify changes to document content.

**Important:** The current version uses browser-local storage for application records and metadata. It does not provide server-side synchronization or persistent cloud storage. Browser storage can be lost if site data is cleared, and it should not be treated as a secure backup.

Do not use real sensitive documents in a demonstration environment without reviewing the implementation and its security limitations.

## 📂 Document Categories

DocShield supports automated categorization intended for document types such as:

- **Identity:** Aadhaar, PAN, passport, voter ID, and driving licence
- **Education:** Marksheets, semester records, degrees, and bonafide certificates
- **Income:** Income certificates, salary slips, income tax returns, and tax documents
- **Community:** Caste and community certificates
- **Other:** Documents that do not match the supported categories

Actual categorization depends on the implemented metadata rules and filename matching.

## 🎯 Project Objectives

- Improve the organization of digital documents.
- Demonstrate client-side document encryption.
- Simplify document discovery through metadata indexing.
- Provide a user-friendly document management experience.
- Explore privacy-focused approaches to digital document storage.

## 🔮 Future Enhancements

- Secure backend integration.
- Persistent cloud storage for encrypted document payloads.
- Cross-device document synchronization.
- Enhanced metadata extraction and document search.
- Improved authentication and account recovery.
- Automated security testing and integrity verification.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a pull request describing your improvements.

## 📄 License

A license has not yet been specified. Add a `LICENSE` file before granting others explicit permission to reuse, modify, or distribute this project.

## 👩‍💻 Author

**Kavishwetha S**

GitHub: [@Kavishwetha07](https://github.com/Kavishwetha07)

---

*DocShield — Protecting documents through privacy-focused digital organization.*
