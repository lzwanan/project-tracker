#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Project Tracker 一键打包脚本
用法：python build.py [--skip-frontend] [--skip-backend] [--clean]
"""

import os
import sys
import subprocess
import shutil
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
STATIC_DIR = os.path.join(BACKEND_DIR, "src", "main", "resources", "static")
JAR_NAME = "project-tracker.jar"
JAR_PATH = os.path.join(BACKEND_DIR, "target", JAR_NAME)

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"


def log(msg, color=CYAN):
    print(f"{color}{msg}{RESET}")


def success(msg):
    print(f"{GREEN}✓ {msg}{RESET}")


def error(msg):
    print(f"{RED}✗ {msg}{RESET}")
    sys.exit(1)


def warn(msg):
    print(f"{YELLOW}⚠ {msg}{RESET}")


def run(cmd, cwd=None):
    """执行命令，失败则退出"""
    log(f"  → {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, shell=False)
    if result.returncode != 0:
        error(f"命令失败: {' '.join(cmd)}")
    return result


def run_npm(args, cwd):
    """执行 npm 命令（Windows 兼容）"""
    if os.name == "nt":
        cmd = ["cmd", "/c", "npm"] + args
    else:
        cmd = ["npm"] + args
    return run(cmd, cwd=cwd)


def run_mvn(args, cwd):
    """执行 Maven 命令（Windows 兼容）"""
    if os.name == "nt":
        cmd = ["cmd", "/c", "mvn"] + args
    else:
        cmd = ["mvn"] + args
    return run(cmd, cwd=cwd)


def build_frontend():
    """构建前端"""
    log("\n📦 [1/2] 构建前端...")
    if not os.path.exists(os.path.join(FRONTEND_DIR, "package.json")):
        error("frontend/package.json 不存在")

    # 清理旧构建产物
    if os.path.exists(STATIC_DIR):
        log("  清理旧的 static 目录...")
        shutil.rmtree(STATIC_DIR)

    # 安装依赖
    log("  安装前端依赖...")
    run_npm(["install"], cwd=FRONTEND_DIR)

    # 构建
    log("  构建前端...")
    run_npm(["run", "build"], cwd=FRONTEND_DIR)

    if os.path.exists(os.path.join(STATIC_DIR, "index.html")):
        success("前端构建完成 → backend/src/main/resources/static/")
    else:
        error("前端构建失败：static/index.html 未生成")


def build_backend():
    """构建后端"""
    log("\n📦 [2/2] 构建后端...")
    if not os.path.exists(os.path.join(BACKEND_DIR, "pom.xml")):
        error("backend/pom.xml 不存在")

    # 清理 + 打包（跳过测试）
    log("  Maven clean + package...")
    run_mvn(["clean", "package", "-DskipTests", "-q"], cwd=BACKEND_DIR)

    if os.path.exists(JAR_PATH):
        size = os.path.getsize(JAR_PATH)
        size_mb = size / (1024 * 1024)
        success(f"后端构建完成 → backend/target/{JAR_NAME} ({size_mb:.1f} MB)")
    else:
        error("后端构建失败：JAR 未生成")


def clean_all():
    """清理所有构建产物"""
    log("\n🧹 清理构建产物...")
    paths = [
        os.path.join(BACKEND_DIR, "target"),
        os.path.join(FRONTEND_DIR, "node_modules"),
        os.path.join(FRONTEND_DIR, "dist"),
        os.path.join(FRONTEND_DIR, ".vite"),
        STATIC_DIR,
    ]
    for p in paths:
        if os.path.exists(p):
            log(f"  删除: {os.path.relpath(p, BASE_DIR)}")
            shutil.rmtree(p, ignore_errors=True)
    success("清理完成")


def main():
    parser = argparse.ArgumentParser(description="Project Tracker 一键打包脚本")
    parser.add_argument("--skip-frontend", action="store_true", help="跳过前端构建")
    parser.add_argument("--skip-backend", action="store_true", help="跳过后端构建")
    parser.add_argument("--clean", action="store_true", help="仅清理构建产物")
    args = parser.parse_args()

    log("\n" + "=" * 50)
    log("  Project Tracker 一键打包")
    log("=" * 50)

    if args.clean:
        clean_all()
        return

    if not args.skip_frontend:
        build_frontend()

    if not args.skip_backend:
        build_backend()

    log("\n" + "=" * 50)
    log("  🎉 打包完成！", GREEN)
    log("=" * 50)
    log(f"  JAR 文件: backend/target/{JAR_NAME}")
    log(f"  启动命令: java -jar backend/target/{JAR_NAME}")
    log(f"  指定配置: java -jar backend/target/{JAR_NAME} --spring.profiles.active=mysql\n")


if __name__ == "__main__":
    main()
