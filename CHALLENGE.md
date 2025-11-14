# Development Challenges & Solutions

## Challenge 1: Git Push Failures Due to Large Repository Size

### Problem
- Git push consistently failed with HTTP 408 timeout errors
- Repository size was 416.65 MiB despite being a simple backend project
- Error messages: `RPC failed; curl 55 Recv failure: Connection was reset`

### Root Cause
- `node_modules/` folder (~200+ MB) was being tracked by Git
- `.mongodb-binaries/` folder (~100+ MB) was committed to repository
- `.env` file with sensitive credentials was exposed in Git history
- `.gitignore` file was either missing or created after files were already tracked

### Solution Steps

1. **Identified Large Files**
```bash
   git count-objects -vH
   git ls-files | Select-String "node_modules"
```

2. **Created Proper .gitignore**
```
   node_modules/
   .cache/
   .mongodb-binaries/
   mongodb-memory-server/
   .vscode/
   .env
   *.log
   npm-debug.log*
   .DS_Store
```

3. **Removed Large Files from Git History**
```bash
   git rm -r --cached node_modules
   git rm -r --cached .mongodb-binaries
   git rm --cached .env
   git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch .mongodb-binaries .env" --prune-empty --tag-name-filter cat -- --all
```

4. **Cleaned Up Git Objects**
```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
```

5. **Started Fresh Repository**
   - Created new clean repository
   - Committed `.gitignore` FIRST before any other files
   - Copied only source code (excluded node_modules, binaries, .env)
   - Force pushed to replace old repository

### Key Learnings

- **Always create `.gitignore` before first commit**
- **Never commit `node_modules/`** - use `npm install` to regenerate
- **Never commit `.env` files** - use environment variables or secrets management
- **Check `git status` before `git add .`** to avoid accidentally staging large files
- **Repository size matters** - keep repos lean for faster clones and pushes
- **Sensitive data in Git history is permanent** - rotate credentials if exposed

### Prevention

- Use `.gitignore` templates for specific frameworks (Node.js, Python, etc.)
- Run `git status` frequently to verify what's being tracked
- Use `git add <specific-files>` instead of `git add .` when unsure
- Set up pre-commit hooks to prevent large file commits
- Regular repository maintenance with `git gc`

### Result
✅ Repository size reduced from 416MB to ~5MB  
✅ Git push operations complete in seconds instead of timing out  
✅ Sensitive credentials removed from Git history  
✅ Clean, maintainable repository structure  

---

## Challenge 2: npm install Taking Too Long

### Problem
Initial `npm install` was taking 10-15 minutes

### Solution
- This is normal for projects with many dependencies
- Subsequent installs are faster due to npm cache
- Can be improved with `npm ci` for CI/CD environments

### Prevention
- Use `package-lock.json` to ensure consistent installs
- Consider using faster package managers like `pnpm` or `yarn` for large projects

---

## Challenge 3: MongoDB Memory Server Binaries

### Problem
`.mongodb-binaries` folder missing after cleanup

### Solution
- Binaries are automatically downloaded by `mongodb-memory-server` on first run
- Kept in `.gitignore` as they're environment-specific and large (~100MB)
- Each developer downloads their own copy

### Best Practice
- Never commit binary files or compiled assets
- Use package managers to handle dependencies
- Document any manual setup steps in README

---

## Resources & References

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub - gitignore templates](https://github.com/github/gitignore)
- [Removing sensitive data from Git history](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Node.js best practices - .gitignore](https://github.com/goldbergyoni/nodebestpractices#-11-use-environment-aware-secure-and-hierarchical-config)

---

**Date:** November 14, 2025  
**Time Spent:** ~2 hours  
**Status:** ✅ Resolved
