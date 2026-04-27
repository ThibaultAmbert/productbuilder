# Code Review Skill

Perform a thorough code review of the specified file(s) or the recently modified code. Focus on two axes: **bugs** and **security**.

## Instructions

If the user provides a file path or file name, review that file. Otherwise, identify recently modified files using git status or git diff, and review those.

### 1. Bug Analysis

Check for:
- Logic errors and incorrect conditions
- Null/undefined dereferences
- Off-by-one errors in loops and array accesses
- Unhandled edge cases (empty arrays, zero values, negative numbers)
- Incorrect error handling or swallowed exceptions
- Race conditions or concurrency issues
- Memory leaks or resource leaks (unclosed files, connections)
- Incorrect type assumptions or implicit coercions

### 2. Security Analysis

Check for OWASP Top 10 and common vulnerabilities:
- **Injection**: SQL injection, command injection, XSS, template injection
- **Broken authentication**: hardcoded credentials, weak tokens, insecure session management
- **Sensitive data exposure**: secrets or API keys in code, unencrypted sensitive data, verbose error messages leaking internals
- **Insecure deserialization**: unsafe use of eval, JSON.parse on untrusted input, pickle/yaml.load
- **Broken access control**: missing authorization checks, path traversal, IDOR
- **Security misconfiguration**: debug mode enabled, permissive CORS, missing security headers
- **Dependency vulnerabilities**: outdated packages with known CVEs (flag if detectable from imports)
- **Insufficient logging**: sensitive operations with no audit trail

### 3. Output Format

Structure the review as follows:

---

## Code Review Report

**File(s) reviewed:** `<paths>`

### Bugs

List each issue with:
- **Severity**: Critical / High / Medium / Low
- **Location**: file:line
- **Issue**: description
- **Fix**: concrete suggestion or corrected snippet

If none found: "No bugs detected."

### Security

List each vulnerability with:
- **Severity**: Critical / High / Medium / Low
- **Category**: OWASP category or vulnerability type
- **Location**: file:line
- **Issue**: description
- **Fix**: concrete suggestion or corrected snippet

If none found: "No security issues detected."

### Summary

One paragraph summarizing the overall code health, the most critical issues to address first, and a confidence level (High / Medium / Low) based on how much context was available.

---

## Behavior

- Be specific: always reference file paths and line numbers.
- Prioritize actionable fixes over theoretical concerns.
- Do not flag style issues unless they create a maintainability risk.
- If the code is in a specific framework (React, Express, Django, etc.), apply framework-specific security best practices.
- Do not invent issues — only report what is observable in the code.
