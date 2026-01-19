---
name: dogecloud 多吉云 文档查询助手
description: 代码出现多吉云相关内容时，可以阅读进行了解详情。
---

# 多吉云文档

## 图片基础处理

```HTML

<article class="markdown-section" id="main"><h1 id="图片基础处理"><a href="/mps/dev-rule-imagemogr2?id=%e5%9b%be%e7%89%87%e5%9f%ba%e7%a1%80%e5%a4%84%e7%90%86" data-id="图片基础处理" class="anchor"><span>图片基础处理</span></a></h1><blockquote>
<p>本文介绍图片处理规则接口 imageMogr2 图片基础处理</p></blockquote>
<p>图片处理规则接口 <code>imageMogr2</code> 提供图片基础处理功能，是最常用的图片处理规则接口。</p><h2 id="使用方法"><a href="/mps/dev-rule-imagemogr2?id=%e4%bd%bf%e7%94%a8%e6%96%b9%e6%b3%95" data-id="使用方法" class="anchor"><span>使用方法</span></a></h2><p>接口 <code>imageMogr2</code> 支持通过 <a href="/mps/dev-process-urlparam">添加参数处理</a> 直接添加在图片链接后面快速处理，本文中所有示例均以添加参数处理形式展现。</p><p>也支持通过 <a href="/mps/dev-op-imageprocess">imageprocess 操作命令</a> 进行同步任务处理和异步任务处理，实现将处理结果保存到指定位置（持久化）或对多个文件同时处理。</p><h2 id="使用限制"><a href="/mps/dev-rule-imagemogr2?id=%e4%bd%bf%e7%94%a8%e9%99%90%e5%88%b6" data-id="使用限制" class="anchor"><span>使用限制</span></a></h2><ul><li>输入的文件必须是 JPG、BMP、GIF、PNG、WebP、HEIF 格式图片；</li><li>输入文件大小不超过 32MB；</li><li>输入图片宽高均不超过 50000 像素，总像素不超过 2.5 亿；</li><li>输出图片宽高不超过 9999 像素。</li></ul><h2 id="规则参数"><a href="/mps/dev-rule-imagemogr2?id=%e8%a7%84%e5%88%99%e5%8f%82%e6%95%b0" data-id="规则参数" class="anchor"><span>规则参数</span></a></h2><p><code>imageMogr2</code> 是一个处理规则接口名称，请先了解 <strong>处理规则</strong> 的 <a href="/mps/dev-process-urlparam?id=%e8%a7%84%e5%88%99%e7%bb%93%e6%9e%84">规则结构</a>。</p><p>该接口无主要参数，而是通过不同的参数对实现不同的处理功能，由于 <code>imageMogr2</code> 支持的功能众多，下面我们按功能分别介绍规则参数。</p><p>多个参数可以在一条规则内组合使用，实现同时处理多个功能。</p><h3 id="通用参数"><a href="/mps/dev-rule-imagemogr2?id=%e9%80%9a%e7%94%a8%e5%8f%82%e6%95%b0" data-id="通用参数" class="anchor"><span>通用参数</span></a></h3><p>这是对每个功能都生效的通用参数：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>format</td>
<td align="center"><code>String</code></td>
<td>格式转换，设置输出的图片格式，支持 <code>jpg</code>、<code>bmp</code>、<code>gif</code>、<code>png</code>、<code>webp</code>，默认不改变原图格式输出</td>
</tr>
<tr>
<td>quality</td>
<td align="center"><code>Int</code></td>
<td>输出图片质量，只对 <code>jpg</code> 和 <code>webp</code> 输出格式生效，取值范围 <code>[1, 100]</code>，默认值为原图质量；<br>取原图质量和指定质量的最小值，数字后面后面加!（半角），表示强制使用指定值</td>
</tr>
<tr>
<td>interlace</td>
<td align="center"><code>Int</code></td>
<td>JPG 渐进显示，网速慢时，JPG 图片显示可以由模糊到清晰，其它格式会忽略此设置，<code>1</code> 为开启，<code>0</code> 为关闭</td>
</tr>
<tr>
<td>cgif</td>
<td align="center"><code>Int</code></td>
<td>GIF 降帧优化，GIF 图片如果帧率大于 30 FPS，则降低到 30 FPS，其它格式会忽略此设置，<code>1</code> 为开启，<code>0</code> 为关闭</td>
</tr>
<tr>
<td>ignore-error</td>
<td align="center"><code>Int</code></td>
<td>是否开启处理出错时直接返回原图，<code>1</code> 为开启，<code>0</code> 为关闭</td>
</tr>
</tbody></table>
<p>文件大小或图片尺寸超过限制等导致处理失败的场景，默认会报错，影响体验，开启 <code>ignore-error</code> 参数选项，则直接返回原图不报错。</p><p>如果你的业务场景大部分都是小图，但偶尔也可能出现超过使用限制（例如大小超过 32 MB）的大图，</p><p>则可以添加 <code>/ignore-error/1</code> 到每条处理规则末尾，遇到大图不报错，提高用户体验。</p><h3 id="缩放"><a href="/mps/dev-rule-imagemogr2?id=%e7%bc%a9%e6%94%be" data-id="缩放" class="anchor"><span>缩放</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>thumbnail</code> 参数提供图片缩放功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>thumbnail</td>
<td align="center"><code>String</code></td>
<td>缩放功能的主要参数，支持下列格式，其中以 <code>&lt;&gt;</code> 包裹的为需要你填充的变量：<br><code>!&lt;scale&gt;p</code>: 缩放到宽高为原图的 scale%，例如 <code>!50p</code> 表示宽和高缩放到原图的 <code>50%</code>；<br><code>!&lt;scale&gt;px</code>: 缩放宽度为原图的 scale%，高度不变，会导致图片变形；<br><code>!x&lt;scale&gt;p</code>: 缩放高度为原图的 scale%，宽度不变，会导致图片变形；<br><code>&lt;w&gt;x</code>: 指定宽度为 w，高度等比缩放，例如 <code>1280x</code>；<br><code>x&lt;h&gt;</code>: 指定高度为 h，宽度等比缩放，例如 <code>x720</code>；<br><code>!&lt;w&gt;x&lt;h&gt;r</code>: 等比缩放，要求缩放后的宽度不能小于 w，高度不能小于 h；<br><code>&lt;w&gt;x&lt;h&gt;</code>: 等比缩放，要求缩小后的宽度不能大于 w，高度不能大于 h；<br><code>&lt;w&gt;x&lt;h&gt;&gt;</code>: 等比缩小，要求缩放后的宽度不能大于 w，高度不能大于 h，例如 <code>300x200&gt;</code>，末尾多了个 <code>&gt;</code>，区别在于不会放大原图；<br><code>&lt;w&gt;x&lt;h&gt;&lt;</code>: 等比放大，要求放大后的宽度不能大于 w，高度不能大于 h，例如 <code>300x200&lt;</code>，末尾多了个 <code>&lt;</code>，区别在于不会缩小原图；<br><code>&lt;w&gt;x&lt;h&gt;!</code>: 指定缩放后的宽度和高度必须为 w 和 h，会导致图片变形；<br><code>&lt;area&gt;@</code>: 缩放到总像素（即宽度乘以高度）不超过 area</td>
</tr>
<tr>
<td>pad</td>
<td align="center"><code>Int</code></td>
<td>是否填充图片边缘至精确的宽度 w 和高度 h，仅针对 <code>thumbnail</code> 为 <code>&lt;w&gt;x&lt;h&gt;</code> 的这一种模式生效，取值 <code>0</code> 或 <code>1</code>，默认不填充即 <code>0</code></td>
</tr>
<tr>
<td>color</td>
<td align="center"><code>String</code></td>
<td>设置 <code>pad</code> 参数填充的颜色，十六进制 HTML 颜色值，例如 <code>#FFFFFF</code>，要求 <a href="/mps/dev-process-urlparam?id=urlsafebase64">URLSafeBase64</a> 编码</td>
</tr>
</tbody></table>
<p>以尺寸为 <code>1920x1200</code> 的原图为例：</p><div class="docsify-tabs docsify-tabs--material">
<button class="docsify-tabs__tab docsify-tabs__tab--active" data-tab="缩放宽高">缩放宽高</button>
<div class="docsify-tabs__content" data-tab-content="缩放宽高">

<p>缩放宽度和高度为原图的 <code>25%</code>：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p" alt="imageMogr2/thumbnail/!25p" class="medium-zoom-image"></p><p>得到的图片宽高为 <code>480x300</code>。</p></div>
<button class="docsify-tabs__tab" data-tab="指定宽度，高度自适应">指定宽度，高度自适应</button>
<div class="docsify-tabs__content" data-tab-content="指定宽度，高度自适应">

<p>指定宽度为 <code>500</code>，高度等比缩放：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/500x</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/500x" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/500x" alt="imageMogr2/thumbnail/500x" class="medium-zoom-image"></p><p>得到的图片宽高为 <code>500x313</code>。</p></div>
<button class="docsify-tabs__tab" data-tab="设置宽高上限">设置宽高上限</button>
<div class="docsify-tabs__content" data-tab-content="设置宽高上限">

<p>等比缩放，要求缩放后的宽度不能大于 <code>400</code>，高度不能大于 <code>400</code>：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400" alt="imageMogr2/thumbnail/400x400" class="medium-zoom-image"></p><p>得到的图片宽高为 <code>400x250</code>。</p></div>
<button class="docsify-tabs__tab" data-tab="设置宽高上限，开启填充">设置宽高上限，开启填充</button>
<div class="docsify-tabs__content" data-tab-content="设置宽高上限，开启填充">

<p>等比缩放，要求缩放后的宽度不能大于 <code>400</code>，高度不能大于 <code>400</code>，不足部分使用灰色（<code>#555555</code>）填充：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400/pad/1/color/IzU1NTU1NQ</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400/pad/1/color/IzU1NTU1NQ" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/400x400/pad/1/color/IzU1NTU1NQ" alt="imageMogr2/thumbnail/400x400/pad/1/color/IzU1NTU1NQ" class="medium-zoom-image"></p><p>不开启填充时，得到的图片宽高为 <code>400x250</code>，开启填充后就得到了要求的宽高 <code>400x400</code>。</p></div>
</div>

<h3 id="定位裁剪"><a href="/mps/dev-rule-imagemogr2?id=%e5%ae%9a%e4%bd%8d%e8%a3%81%e5%89%aa" data-id="定位裁剪" class="anchor"><span>定位裁剪</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>cut</code> 参数提供图片定位裁剪功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>cut</td>
<td align="center"><code>String</code></td>
<td>格式为 <code>&lt;w&gt;x&lt;h&gt;x&lt;dx&gt;x&lt;dy&gt;</code>，表示以裁剪参考点为起始点，水平、竖直方向偏移量分别为 dx、dy 裁剪出宽 w 高 h 的图片</td>
</tr>
<tr>
<td>gravity</td>
<td align="center"><code>String</code></td>
<td>裁剪参考点，与 <code>cut</code> 参数搭配时默认为左上角（<code>northwest</code>），支持下列值：<br><code>northwest</code>: 左上角；<code>north</code>: 图片上边中心；<code>northeast</code>: 右上角；<br><code>west</code>: 图片左边中心；<code>center</code>: 图片正中心；<code>east</code>: 图片右边中心；<br><code>southwest</code>: 左下角；<code>south</code>: 图片下边中心；<code>southeast</code>: 右下角。<br>裁剪参考点在水平或竖直方向位于“中心”时，对应方向的偏移量 dx 或 dy 不会生效</td>
</tr>
</tbody></table>
<p>从图片左上顶点向右偏移 <code>500</code>，向下偏移 <code>400</code> 的位置开始，裁剪出 <code>300x200</code> 的图片：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/cut/300x200x500x400</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/cut/300x200x500x400" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/cut/300x200x500x400" alt="imageMogr2/cut/300x200x500x400" class="medium-zoom-image"></p><h3 id="缩放裁剪"><a href="/mps/dev-rule-imagemogr2?id=%e7%bc%a9%e6%94%be%e8%a3%81%e5%89%aa" data-id="缩放裁剪" class="anchor"><span>缩放裁剪</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>crop</code> 参数提供图片缩放裁剪功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>crop</td>
<td align="center"><code>String</code></td>
<td>格式为 <code>&lt;w&gt;x&lt;h&gt;</code>，表示要缩放到的宽和高，如果比例不符将进行裁剪；<br>宽和高可以省略其中一个，表示不进行缩放，只把其中一边裁剪到指定值，例如 <code>300x</code> 表示裁剪出宽度 <code>300</code>，高度不变</td>
</tr>
<tr>
<td>gravity</td>
<td align="center"><code>String</code></td>
<td>裁剪参考点，与 <code>crop</code> 参数搭配时默认为中心（<code>center</code>），支持下列值：<br><code>northwest</code>: 左上角；<code>north</code>: 图片上边中心；<code>northeast</code>: 右上角；<br><code>west</code>: 图片左边中心；<code>center</code>: 图片正中心；<code>east</code>: 图片右边中心；<br><code>southwest</code>: 左下角；<code>south</code>: 图片下边中心；<code>southeast</code>: 右下角</td>
</tr>
</tbody></table>
<p>以图片中心点为裁剪参考点，缩放裁剪至 <code>300×400</code>：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/crop/300x400/gravity/center</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/crop/300x400/gravity/center" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/crop/300x400/gravity/center" alt="imageMogr2/crop/300x400/gravity/center" class="medium-zoom-image"></p><h3 id="圆形裁剪"><a href="/mps/dev-rule-imagemogr2?id=%e5%9c%86%e5%bd%a2%e8%a3%81%e5%89%aa" data-id="圆形裁剪" class="anchor"><span>圆形裁剪</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>iradius</code> 和 <code>rradius</code> 参数提供图片圆形裁剪功能，支持与其它图片处理参数配合使用：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>iradius</td>
<td align="center"><code>Int</code></td>
<td>内切圆裁剪的半径，内切圆的圆心为图片的中心</td>
</tr>
<tr>
<td>rradius</td>
<td align="center"><code>Int</code></td>
<td>圆角矩形裁剪的半径，圆角与原图边缘相切</td>
</tr>
</tbody></table>
<p>由于圆形裁剪后一般会有透明区域，如果原图是 <code>jpg</code> 等不支持透明通道的格式，可以配合格式转换参数 <code>format</code> 转换为支持透明通道的格式</p><p>分别对原图进行半径为 <code>200</code> 的内切圆裁剪和圆角矩形裁剪，并转换格式为 <code>png</code> 和 <code>webp</code>：</p><div class="docsify-tabs docsify-tabs--material">
<button class="docsify-tabs__tab docsify-tabs__tab--active" data-tab="内切圆裁剪">内切圆裁剪</button>
<div class="docsify-tabs__content" data-tab-content="内切圆裁剪">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/iradius/200/format/png</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/iradius/200/format/png" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/iradius/200/format/png" alt="imageMogr2/iradius/200/format/png" class="medium-zoom-image"></p></div>
<button class="docsify-tabs__tab" data-tab="圆角矩形裁剪">圆角矩形裁剪</button>
<div class="docsify-tabs__content" data-tab-content="圆角矩形裁剪">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/rradius/200/format/webp</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/rradius/200/format/webp" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/rradius/200/format/webp" alt="imageMogr2/rradius/200/format/webp" class="medium-zoom-image"></p></div>
</div>

<h3 id="旋转与翻转"><a href="/mps/dev-rule-imagemogr2?id=%e6%97%8b%e8%bd%ac%e4%b8%8e%e7%bf%bb%e8%bd%ac" data-id="旋转与翻转" class="anchor"><span>旋转与翻转</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>rotate</code> 和 <code>flip</code> 参数提供图片旋转和翻转功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>rotate</td>
<td align="center"><code>Int</code></td>
<td>旋转角度，支持范围 <code>(0, 360)</code></td>
</tr>
<tr>
<td>flip</td>
<td align="center"><code>String</code></td>
<td>镜像翻转，支持的值：<code>vertical</code> 垂直翻转；<code>horizontal</code> 水平翻转</td>
</tr>
<tr>
<td>auto-orient</td>
<td align="center"></td>
<td>根据原图 EXIF 信息将图片自适应旋转回正</td>
</tr>
</tbody></table>
<p>对原图进行缩放，然后分别进行 <code>90°</code> 旋转和垂直镜像翻转：</p><div class="docsify-tabs docsify-tabs--material">
<button class="docsify-tabs__tab docsify-tabs__tab--active" data-tab="旋转">旋转</button>
<div class="docsify-tabs__content" data-tab-content="旋转">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/rotate/90</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/rotate/90" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/rotate/90" alt="imageMogr2/thumbnail/!25p/rotate/90" class="medium-zoom-image"></p></div>
<button class="docsify-tabs__tab" data-tab="翻转">翻转</button>
<div class="docsify-tabs__content" data-tab-content="翻转">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/flip/vertical</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/flip/vertical" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/flip/vertical" alt="imageMogr2/thumbnail/!25p/flip/vertical" class="medium-zoom-image"></p></div>
</div>

<h3 id="高斯模糊"><a href="/mps/dev-rule-imagemogr2?id=%e9%ab%98%e6%96%af%e6%a8%a1%e7%b3%8a" data-id="高斯模糊" class="anchor"><span>高斯模糊</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>blur</code> 参数提供图片高斯模糊功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>blur</td>
<td align="center"><code>String</code></td>
<td>格式为 <code>&lt;radius&gt;x&lt;sigma&gt;</code>，其中 radius 为模糊半径，取值范围 <code>[1, 50]</code>，sigma 为标准差，需要大于 <code>0</code></td>
</tr>
</tbody></table>
<p>对原图进行缩放，然后进行模糊半径为 <code>3</code>，标准差为 <code>5</code> 的高斯模糊：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/blur/3x5</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/blur/3x5" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/blur/3x5" alt="imageMogr2/thumbnail/!25p/blur/3x5" class="medium-zoom-image"></p><h3 id="锐化"><a href="/mps/dev-rule-imagemogr2?id=%e9%94%90%e5%8c%96" data-id="锐化" class="anchor"><span>锐化</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>sharpen</code> 参数提供图片高斯模糊功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>sharpen</td>
<td align="center"><code>Int</code></td>
<td>锐化参数，取值范围 <code>[10, 300]</code>，值越大，锐化效果越明显</td>
</tr>
</tbody></table>
<p>对原图进行缩放，然后进行参数为 <code>100</code> 的锐化：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/sharpen/100</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/sharpen/100" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/sharpen/100" alt="imageMogr2/thumbnail/!25p/sharpen/100" class="medium-zoom-image"></p><h3 id="亮度与对比度"><a href="/mps/dev-rule-imagemogr2?id=%e4%ba%ae%e5%ba%a6%e4%b8%8e%e5%af%b9%e6%af%94%e5%ba%a6" data-id="亮度与对比度" class="anchor"><span>亮度与对比度</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>bright</code>、<code>contrast</code> 参数提供图片亮度、对比度调整功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>bright</td>
<td align="center"><code>Int</code></td>
<td>亮度，取值范围 <code>[-100, 100]</code>，取负数、0、正数分别表示降低图片亮度、不变、提高图片亮度</td>
</tr>
<tr>
<td>contrast</td>
<td align="center"><code>Int</code></td>
<td>对比度，取值范围 <code>[-100, 100]</code>，取负数、0、正数分别表示降低图片对比度、不变、提高图片对比度</td>
</tr>
</tbody></table>
<p>对原图进行缩放，然后分别提高图片亮度和对比度 <code>70</code>：</p><div class="docsify-tabs docsify-tabs--material">
<button class="docsify-tabs__tab docsify-tabs__tab--active" data-tab="亮度">亮度</button>
<div class="docsify-tabs__content" data-tab-content="亮度">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/bright/70</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/bright/70" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/bright/70" alt="imageMogr2/thumbnail/!25p/bright/70" class="medium-zoom-image"></p></div>
<button class="docsify-tabs__tab" data-tab="对比度">对比度</button>
<div class="docsify-tabs__content" data-tab-content="对比度">

<pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/contrast/70</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/contrast/70" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/contrast/70" alt="imageMogr2/thumbnail/!25p/contrast/70" class="medium-zoom-image"></p></div>
</div>

<h3 id="灰度图"><a href="/mps/dev-rule-imagemogr2?id=%e7%81%b0%e5%ba%a6%e5%9b%be" data-id="灰度图" class="anchor"><span>灰度图</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>grayscale</code> 参数提供图片灰度图功能：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>grayscale</td>
<td align="center"><code>Int</code></td>
<td>取值为 <code>1</code> 表示开启灰度图功能</td>
</tr>
</tbody></table>
<p>对原图进行缩放，然后开启灰度图：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/grayscale/1</code><button class="docsify-copy-code-button">点击复制</button></pre><p><img src="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/grayscale/1" data-origin="https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/thumbnail/!25p/grayscale/1" alt="imageMogr2/thumbnail/!25p/grayscale/1" class="medium-zoom-image"></p><h3 id="去除元信息"><a href="/mps/dev-rule-imagemogr2?id=%e5%8e%bb%e9%99%a4%e5%85%83%e4%bf%a1%e6%81%af" data-id="去除元信息" class="anchor"><span>去除元信息</span></a></h3><p><code>imageMogr2</code> 接口通过 <code>strip</code> 参数提供去除图片元信息功能，可以去除 EXIF 等图片元信息：</p><table>
<thead>
<tr>
<th>参数名</th>
<th align="center">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>strip</td>
<td align="center"></td>
<td>携带此参数时表示去除图片元信息</td>
</tr>
</tbody></table>
<p>去除图片 EXIF 等元信息：</p><pre v-pre="" data-lang="url"><code class="lang-url">https://s-sh-1-imgexample.oss.dogecdn.com/demo/preview-x-cat.jpg?imageMogr2/strip</code><button class="docsify-copy-code-button">点击复制</button></pre></article>
```
