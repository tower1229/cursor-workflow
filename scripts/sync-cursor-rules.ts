import { existsSync, readdirSync, lstatSync, symlinkSync, unlinkSync } from "fs";
import { join, relative, resolve } from "path";

const CURSOR_RULES_DIR = resolve(".cursor/rules");
const SHARED_RULES_DIR = resolve(".cursor/shared/rules");

function syncCursorRules() {
  // 确保 .cursor/rules 目录存在
  if (!existsSync(CURSOR_RULES_DIR)) {
    console.error(`❌ Directory ${CURSOR_RULES_DIR} does not exist`);
    process.exit(1);
  }

  // 检查共享规则目录是否存在
  if (!existsSync(SHARED_RULES_DIR)) {
    console.warn(`⚠️  Shared rules directory ${SHARED_RULES_DIR} does not exist`);
    console.log("💡 Run: git submodule add git@github.com:tower1229/cursor-config.git .cursor/shared");
    return;
  }

  // 读取共享规则目录中的所有 .mdc 文件
  const sharedRules = readdirSync(SHARED_RULES_DIR).filter((file) =>
    file.endsWith(".mdc")
  );

  if (sharedRules.length === 0) {
    console.log("ℹ️  No shared rules found");
    return;
  }

  let linked = 0;
  let skipped = 0;

  for (const rule of sharedRules) {
    const sharedPath = join(SHARED_RULES_DIR, rule);
    const linkPath = join(CURSOR_RULES_DIR, rule);

    // 如果链接已存在，先删除
    if (existsSync(linkPath)) {
      try {
        const stats = lstatSync(linkPath);
        if (stats.isSymbolicLink()) {
          unlinkSync(linkPath);
        } else {
          console.warn(`⚠️  ${rule} exists as a regular file, skipping`);
          skipped++;
          continue;
        }
      } catch (error) {
        console.warn(`⚠️  Error checking ${rule}:`, error);
        skipped++;
        continue;
      }
    }

    // 创建符号链接（使用相对路径）
    const relativePath = relative(CURSOR_RULES_DIR, sharedPath);
    try {
      symlinkSync(relativePath, linkPath);
      console.log(`✅ Linked: ${rule}`);
      linked++;
    } catch (error) {
      console.error(`❌ Failed to link ${rule}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${linked} linked, ${skipped} skipped`);
}

syncCursorRules();

