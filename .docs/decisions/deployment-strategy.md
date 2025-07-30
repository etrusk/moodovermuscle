# Deployment Strategy Documentation

## Overview

This document outlines the deployment strategy for the MoodOverMuscle fitness website, a Next.js application deployed on Vercel. It focuses on a two-environment model (Production and Preview) to support a fast and reliable continuous deployment pipeline.

## Table of Contents

1. [Environment Strategy](#1-environment-strategy)
2. [Deployment Process](#2-deployment-process)
3. [Performance Optimization](#3-performance-optimization)
4. [Security Configuration](#4-security-configuration)
5. [Monitoring and Alerting](#5-monitoring-and-alerting)
6. [Deployment Automation](#6-deployment-automation)
7. [Troubleshooting Guide](#7-troubleshooting-guide)

---

**Document Information**

- **Last Updated**: 2025-07-27
- **Version**: 1.0
- **Owner**: Development Team
- **Review Schedule**: Quarterly

---

## 1. Environment Strategy

Our deployment strategy is centered around a two-environment model, powered by Vercel.

| Environment    | Trigger        | URL                           | Purpose                                                       |
| -------------- | -------------- | ----------------------------- | ------------------------------------------------------------- |
| **Production** | Push to `main` | https://moodovermuscle.com.au | The live customer-facing website.                             |
| **Preview**    | Pull Request   | `[branch-name].vercel.app`    | Isolated environments for testing and reviewing new features. |

### Environment Configuration

Vercel automatically manages environment variables for production and preview deployments.

- **Production**: Uses `production` environment variables defined in `vercel.json` and the Vercel dashboard.
- **Preview**: Uses `preview` environment variables, inheriting from production where not specified.

## 2. Deployment Process

### Automated Deployments with Vercel

1.  **Pull Request**: When a pull request is opened, Vercel automatically builds the changes and deploys them to a unique **Preview URL**.
2.  **CI Checks**: Our GitHub Actions workflow runs a series of checks (linting, testing, build validation) on the PR.
3.  **Merge**: Once the PR is approved and all checks pass, it is merged into `main`.
4.  **Production Deployment**: The merge to `main` triggers a production deployment on Vercel.

### Rollback Procedures

Vercel provides instant rollbacks with a single click.

1.  Navigate to the **Deployments** tab in the Vercel dashboard.
2.  Select the deployment you want to restore.
3.  Click the **Redeploy** button.

## 3. Performance Optimization

### Build & CDN

- **Build Optimization**: Handled automatically by Next.js and Vercel.
- **CDN**: Vercel’s Edge Network provides global content delivery.
- **Image Optimization**: Automatic image optimization with Next.js.

## 4. Security Configuration

### Security Headers

Security headers are configured in `vercel.json` to protect against common web vulnerabilities.

### SSL/TLS

Vercel automatically provisions and renews SSL certificates for all domains.

## 5. Monitoring and Alerting

- **Vercel Analytics**: Provides real-time performance and usage metrics.
- **GitHub Actions**: Monitors build and test failures.
- **Husky Hooks**: The `pre-push` hook runs quality checks before code is pushed, preventing broken builds.

## 6. Deployment Automation

The entire deployment process is automated through the **Vercel for GitHub** integration and our **GitHub Actions CI/CD workflow**.

## 7. Troubleshooting Guide

- **Build Failures**: Check the Vercel deployment logs and GitHub Actions output for errors.
- **Performance Issues**: Use Vercel's Speed Insights to identify and address performance bottlenecks.

---

**Last Updated**: July 2025  
**Next Review**: October 2025  
**Owner**: Development Team  
**Stakeholders**: Product, Engineering, Operations
