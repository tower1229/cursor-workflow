# Create Prompt - 精简提示词生成器

## 命令用途

将模糊需求转换为精准的执行指令。**核心原则：引用而非复制，指引而非填充。**

## 使用方式

```
/create-prompt <需求描述>
```

---

## 执行流程

### 1. 理解需求

快速识别：

- **意图**：创建/修改/修复/优化/查询
- **对象**：具体文件、功能或模块
- **模糊点**：需要澄清的部分

### 2. 探索上下文（静默执行）

根据需求类型，快速探索相关代码：

- 搜索关键词定位相关文件
- 识别可复用的模式和组件
- 确认技术栈和约束

> **注意**：探索结果用于理解，不需要在提示词中复述。

### 3. 生成提示词

只输出大模型**无法自动获取**的关键信息。

---

## 提示词模板

```markdown
## 任务

[一句话明确任务目标]

## 相关资源

- 需求文档：`path/to/prd.md`
- 入口文件：`path/to/entry.tsx`
- 参考实现：`path/to/reference.ts`（[简述参考什么]）

## 实现要点

1. [关键决策点或非显而易见的实现细节]
2. [需要特别注意的约束]
3. [与现有代码的集成方式]

## 待确认

- [ ] [需要用户确认的问题]

## 验收标准

1. [可验证的完成标准]
```

---

## 核心规则

### ✅ 应该包含

| 类型         | 示例                                       |
| ------------ | ------------------------------------------ |
| 文件路径引用 | `参考 src/hooks/useXxx.ts 的模式`          |
| 关键决策     | `使用 MMKV 而非 AsyncStorage 存储`         |
| 非显式约束   | `Canister ID 需从环境变量读取`             |
| 集成点说明   | `在 WalletHeader 的 Top-Up 按钮触发`       |
| 待澄清问题   | `network 参数应使用 devnet 还是 mainnet？` |

### ❌ 不应该包含

| 类型           | 原因                                 |
| -------------- | ------------------------------------ |
| 复制代码片段   | 大模型可以自己读取文件               |
| 重复 PRD 内容  | 已提供文档路径，无需复述             |
| 列举已安装依赖 | 可从 package.json 获取               |
| 详细 API 定义  | 文档中已有，引用即可                 |
| 目录结构建议   | 除非有特殊要求，否则让大模型自行决策 |

---

## 精简示例

### 输入

```
/create-prompt 根据 PRD 文档实现 Top-Up External Wallet 功能
```

### 输出

```markdown
## 任务

实现外部钱包充值功能，支持用户扫码从外部钱包充值 USDC 并自动 mint vUSD。

## 相关资源

- 需求文档：`docs/prd/topup-external-wallet-prd.md`
- 修改入口：`src/components/Views/Wallet/WalletHeader.tsx`（Top-Up 按钮）
- 参考实现：
  - `src/components/UI/BottomSheet/` - 弹窗组件
  - `src/components/Views/Receive/` - QR 码生成
  - `src/utils/ICBridgeService.ts` - ICP Actor 模式

## 实现要点

1. 新增 ICP Canister 服务调用 `generate_address_mapping` 和 `confirm_tx_hash`
2. 入金地址与用户 PID 为 1:1，首次获取后缓存到 MMKV
3. 轮询策略：二维码页面 15s 轮询，Wallet 首页单次检测
4. 选择 "In-App Crypto Wallet" 保持原有导航到 Bridge 页面

## 待确认

- [ ] Canister IDL 文件是否需要生成？还是会提供？
- [ ] 环境变量中是否已配置新 Canister ID？
- [ ] network 参数：`solana_devnet` 或 `solana`？

## 验收标准

1. 完整流程可走通：Top-Up → 选择方式 → 选币种 → 展示二维码 → 检测入金 → mint 成功
2. 现有 In-App Wallet 充值功能不受影响
```

---

## 场景快捷处理

### 修复 Bug

```markdown
## 任务

修复 [具体问题描述]

## 复现路径

[操作步骤或错误日志]

## 相关文件

- `path/to/problematic-file.ts`
```

### 添加功能

```markdown
## 任务

在 [位置] 添加 [功能]

## 相关资源

- 需求：[文档路径或简述]
- 参考：`path/to/similar-feature/`
```

### 重构优化

```markdown
## 任务

优化 [目标]，目前问题是 [现状]

## 约束

- [必须保持的行为]
- [不能改动的部分]
```

---

## 语言规范

- 提示词使用中文
- 代码、路径、技术术语保留英文
