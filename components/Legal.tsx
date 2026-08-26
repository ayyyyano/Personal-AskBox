type LegalContentProps = {
  siteName: string;
  siteUrl: string;
};

export function TermsContent({ siteName, siteUrl }: LegalContentProps) {
  return (
    <>
      <p>欢迎使用 {siteName}（以下简称"本服务"），网址为 {siteUrl}。</p>
      <p>本服务为个人匿名提问平台，允许用户向网站管理者提交问题、留言或消息。当您访问或使用本服务时，即表示您已阅读、理解并同意遵守本协议之全部内容。</p>

      <h2>一、服务内容</h2>
      <p>本服务提供：</p>
      <ul>
        <li>匿名提问（可附带图片附件，支持 PNG / JPG / WebP / GIF 格式）</li>
        <li>自愿填写昵称</li>
        <li>公开问答展示（由管理者选择回答并发布后显示）</li>
        <li>人机验证机制（Cloudflare Turnstile）</li>
        <li>全文搜索（由 Algolia 提供，管理者可选择开启或关闭）</li>
        <li>深色模式切换</li>
      </ul>
      <p>本服务有权随时新增、修改、暂停或终止部分功能。</p>

      <h2>二、使用规范</h2>
      <p>您同意不利用本服务从事下列行为：</p>
      <ul>
        <li>发布诽谤、侮辱、威胁、骚扰、歧视或煽动仇恨的内容</li>
        <li>发布色情、暴力、血腥或其他不适当内容</li>
        <li>散布恶意程序、钓鱼链接、诈骗信息或垃圾消息</li>
        <li>尝试干扰、攻击、破坏本服务正常运作</li>
        <li>利用自动化工具大量提交内容（本服务设有频率限制，同一 IP 每小时最多提交 20 条）</li>
      </ul>
      <p>管理者有权删除任何违反本协议之内容，并采取必要限制措施。</p>

      <h2>三、提问内容</h2>
      <ul>
        <li>用户应自行对其提交内容负责</li>
        <li>提交内容不代表本服务或管理者的立场</li>
        <li>管理者有权保存、查看、删除或拒绝展示提问内容</li>
      </ul>

      <h2>四、匿名性说明</h2>
      <p>本服务允许匿名提问，用户可以选择填写昵称或留空。</p>
      <p>匿名不代表完全无法识别。为维护服务安全、防止滥用及处理违规行为，本服务会记录部分技术信息（详见隐私政策）。</p>

      <h2>五、服务可用性</h2>
      <p>本服务依"现状"提供，基于 Cloudflare Workers 运行。管理者不保证：</p>
      <ul>
        <li>服务持续不中断</li>
        <li>服务完全无错误</li>
        <li>所有数据永久保存</li>
      </ul>
      <p>因系统故障、维护、网络问题或不可抗力因素造成的损失，管理者不承担责任。</p>

      <h2>六、知识产权</h2>
      <p>本服务网站设计、程序代码、版面及相关内容，其权利均归管理者或原始作者所有。未授权不得复制、散布、修改或用于商业用途。</p>

      <h2>七、协议修改</h2>
      <p>管理者有权随时修改本协议。修改后版本公布于本页面时立即生效。继续使用本服务即视为接受更新内容。</p>

      <h2>八、联系方式</h2>
      <p>如对本协议有任何疑问，可通过 GitHub 项目主页联系：<a href="https://github.com/ayyyyano/Personal-AskBox">github.com/ayyyyano/Personal-AskBox</a></p>
    </>
  );
}

export function PrivacyContent({ siteName, siteUrl }: LegalContentProps) {
  return (
    <>
      <p>{siteName}（网址：{siteUrl}，以下简称"本服务"）重视用户隐私。本政策说明本服务收集、使用及保护信息的方式。使用本服务即表示同意本政策内容。</p>

      <h2>一、我们收集的信息</h2>
      <h3>1.1 用户主动提供的信息</h3>
      <ul>
        <li><strong>提问内容</strong>：您在输入框中填写的文字</li>
        <li><strong>昵称</strong>：您自愿填写的名称（可留空，即为匿名）</li>
        <li><strong>图片附件</strong>：您选择上传的图片文件（PNG / JPG / WebP / GIF）</li>
      </ul>

      <h3>1.2 系统自动收集的信息</h3>
      <ul>
        <li><strong>IP 地址</strong>（经 SHA-256 哈希处理后存储，用于频率限制）</li>
        <li><strong>User-Agent</strong>（浏览器与设备信息）</li>
        <li><strong>提交时间</strong></li>
        <li><strong>Cloudflare Turnstile 验证结果</strong>（人机验证是否通过）</li>
      </ul>

      <h2>二、信息用途</h2>
      <p>收集的信息主要用于：</p>
      <ul>
        <li>接收与管理提问内容</li>
        <li>防止垃圾消息与恶意滥用</li>
        <li>同一 IP 频率限制（每小时 20 条）</li>
        <li>人机验证（Cloudflare Turnstile）</li>
        <li>全文搜索索引（Algolia，仅在管理者启用时生效）</li>
        <li>系统安全与异常检测</li>
      </ul>

      <h2>三、第三方服务</h2>
      <p>本服务使用以下第三方服务：</p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <th style={{ padding: 8, textAlign: "left" }}>服务</th>
            <th style={{ padding: 8, textAlign: "left" }}>用途</th>
            <th style={{ padding: 8, textAlign: "left" }}>涉及数据</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <td style={{ padding: 8 }}>Cloudflare Workers</td>
            <td style={{ padding: 8 }}>网站托管与运行</td>
            <td style={{ padding: 8 }}>全部请求流量</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <td style={{ padding: 8 }}>Cloudflare D1</td>
            <td style={{ padding: 8 }}>数据库存储</td>
            <td style={{ padding: 8 }}>提问内容及元数据</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <td style={{ padding: 8 }}>Cloudflare KV</td>
            <td style={{ padding: 8 }}>频率限制计数</td>
            <td style={{ padding: 8 }}>匿名 IP 哈希</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <td style={{ padding: 8 }}>Cloudflare R2</td>
            <td style={{ padding: 8 }}>图片附件存储</td>
            <td style={{ padding: 8 }}>上传的图片文件</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgb(var(--mdui-color-outline-variant))" }}>
            <td style={{ padding: 8 }}>Cloudflare Turnstile</td>
            <td style={{ padding: 8 }}>人机验证</td>
            <td style={{ padding: 8 }}>验证交互数据</td>
          </tr>
          <tr>
            <td style={{ padding: 8 }}>Algolia（可选）</td>
            <td style={{ padding: 8 }}>全文搜索</td>
            <td style={{ padding: 8 }}>提问内容、昵称、回答</td>
          </tr>
        </tbody>
      </table>
      <p>第三方服务按其自身隐私政策处理数据。Algolia 搜索为可选功能，由管理者决定是否启用。</p>

      <h2>四、数据保存</h2>
      <ul>
        <li>提问内容及相关记录保存于 Cloudflare D1 数据库中</li>
        <li>图片附件保存于 Cloudflare R2 存储桶中</li>
        <li>频率限制计数器保存于 Cloudflare KV 中，按小时自动过期</li>
        <li>IP 地址以 SHA-256 哈希形式存储，不保留原始 IP</li>
        <li>管理者可随时手动删除任何数据</li>
      </ul>

      <h2>五、数据分享</h2>
      <p>除以下情况外，本服务不向第三方出售、出租或分享数据：</p>
      <ul>
        <li>法律要求或司法/政府机关依法要求</li>
        <li>保护本服务、管理者或他人的合法权益</li>
        <li>处理滥用、攻击或违法行为</li>
      </ul>

      <h2>六、数据安全</h2>
      <p>本服务托管于 Cloudflare 全球网络，数据传输全程使用 HTTPS 加密。尽管采取了合理的技术措施，任何网络传输或电子存储方式均无法保证百分之百安全。</p>

      <h2>七、Algolia 搜索</h2>
      <p>当管理者启用 Algolia 搜索功能时：</p>
      <ul>
        <li>新提交的问题会自动同步至 Algolia 索引</li>
        <li>同步内容包括：提问文字、昵称、回答内容、状态、时间</li>
        <li>搜索服务由 Algolia 提供，相关数据处理受 Algolia 隐私政策约束</li>
        <li>管理者可通过 Algolia Dashboard 删除索引数据</li>
      </ul>

      <h2>八、用户权利</h2>
      <p>如适用法律赋予相关权利，您可以向管理者提出：</p>
      <ul>
        <li>查询您的数据</li>
        <li>更正不准确的数据</li>
        <li>删除您的数据</li>
        <li>提出隐私相关问题</li>
      </ul>
      <p>管理者将在合理范围内处理。请注意，匿名提问无法通过身份验证来确认数据归属。</p>

      <h2>九、政策修改</h2>
      <p>本服务有权随时更新本政策。更新后版本公布即生效。继续使用本服务表示同意更新内容。</p>

      <h2>十、联系方式</h2>
      <p>如对本政策有任何疑问，请通过以下方式联系：</p>
      <p><a href="https://github.com/ayyyyano/Personal-AskBox">github.com/ayyyyano/Personal-AskBox</a></p>
    </>
  );
}

export const LAST_UPDATED = "2026年6月28日";
