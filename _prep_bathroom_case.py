#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
向 elfDXiao.github.io 的浴室案例图库追加一条 360° 案例。

做的事（全部幂等可重跑）：
  1. 从 js/city-data.js 解析省份/城市 adcode（--province / --city 可传中文名或 6 位 adcode）
  2. 把原始全景图处理成站点格式：img/360/<name>.jpg (8192x4096 JPEG q90)
                             + img/360/<name>-thumb.jpg (800x400)
  3. 在 js/case-gallery-data.js 的 bathroom 板块下追加案例记录（保持原缩进与风格）

用法示例：
  python prep_bathroom_case.py \
      --panorama "C:/Users/leone/Downloads/xxx.jpg" \
      --province 江苏省 --city 苏州市 \
      --id p-sz-01 --image-name spage-sz-01 \
      --title "SPAGE 整体浴室 · 苏州" \
      --brand "LIXIL（リクシル）" --series "SPAGE（スページ）" \
      --price "¥65,000（含安装）" \
      --desc "LIXIL SPAGE 系列整体浴室，含有肩乐汤及腰乐汤。" \
      --tags "SPAGE,肩乐汤,腰乐汤"

先加 --dry-run 预览，确认无误再去掉。
"""
import argparse, json, os, re, shutil, subprocess, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

W, H = 8192, 4096     # 与南通实拍图一致
TW, TH = 800, 400     # 缩略图
THUMB_Q = 86


def die(msg):
    print("  [错误] " + msg)
    sys.exit(1)


def load_city_data(site):
    """解析 js/city-data.js -> {prov_adcode: {'name':..,'cities':[{adcode,name}]}}"""
    p = os.path.join(site, "js", "city-data.js")
    if not os.path.isfile(p):
        die("找不到 " + p)
    txt = open(p, encoding="utf-8").read()
    m = re.search(r"window\.CITY_DATA\s*=\s*(\{.*\})\s*;?\s*$", txt, re.S)
    if not m:
        die("city-data.js 里没找到 window.CITY_DATA")
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        die("CITY_DATA JSON 解析失败: %s" % e)


def resolve(city_data, province, city):
    """省份/城市 支持中文名或 adcode，返回 (prov_adcode, prov_name, city_adcode, city_name)"""
    pa = None
    if re.fullmatch(r"\d{6}", province):
        pa = province if province in city_data else None
    if pa is None:
        for k, v in city_data.items():
            if v.get("name") == province or v.get("name", "").startswith(province):
                pa = k
                break
    if pa is None:
        die("省份 %r 不在 city-data.js 中" % province)

    ca = None
    cities = city_data[pa].get("cities", [])
    if re.fullmatch(r"\d{6}", city):
        ca = city if any(c["adcode"] == city for c in cities) else None
    if ca is None:
        for c in cities:
            if c["name"] == city or c["name"].startswith(city):
                ca = c["adcode"]
                break
    if ca is None:
        die("城市 %r 不在 %s 的城市列表中" % (city, city_data[pa]["name"]))

    return pa, city_data[pa]["name"], ca, next(c["name"] for c in cities if c["adcode"] == ca)


# ---------------- 图片 ----------------
def make_images(src, out_dir, name, dry):
    if not os.path.isfile(src):
        die("找不到全景原图 " + src)
    im = Image.open(src)
    im = im.convert("RGB")
    w, h = im.size
    ratio = w / h
    print("  原图 %dx%d  比例 %.5f" % (w, h, ratio))
    if abs(ratio - 2.0) > 0.02:
        die("原图不是 360 等距柱状投影的 2:1 比例（实际 %.4f）。"
            "请确认这是全景原图而不是普通照片。" % ratio)
    if w < W:
        print("  [注意] 原图宽度 %d < %d，将放大输出（细节不会增加）" % (w, W))

    big = im.resize((W, H), Image.LANCZOS)
    thumb = big.resize((TW, TH), Image.LANCZOS)

    main_p = os.path.join(out_dir, name + ".jpg")
    thumb_p = os.path.join(out_dir, name + "-thumb.jpg")

    if dry:
        print("  [dry-run] 将写入 %s (8192x4096)" % main_p)
        print("  [dry-run] 将写入 %s (800x400)" % thumb_p)
        return os.path.relpath(main_p, os.path.dirname(out_dir)).replace("\\", "/"), \
               os.path.relpath(thumb_p, os.path.dirname(out_dir)).replace("\\", "/")

    big.save(main_p, quality=90, optimize=True, progressive=True)
    thumb.save(thumb_p, quality=THUMB_Q, optimize=True)
    print("  ✓ %s  %.2f MB" % (os.path.basename(main_p), os.path.getsize(main_p) / 1048576))
    print("  ✓ %s  %.1f KB" % (os.path.basename(thumb_p), os.path.getsize(thumb_p) / 1024))
    return "img/360/" + name + ".jpg", "img/360/" + name + "-thumb.jpg"


# ---------------- 数据文件插入 ----------------
def bathroom_block_span(lines):
    """返回 (start, end) 行号，覆盖 '  bathroom: {' 到它的收尾 '  },'"""
    start = None
    for i, ln in enumerate(lines):
        if re.match(r"^  bathroom:\s*\{", ln):
            start = i
            break
    if start is None:
        die("case-gallery-data.js 里没找到 bathroom 板块")
    depth = 0
    for j in range(start, len(lines)):
        depth += lines[j].count("{") - lines[j].count("}")
        if j > start and depth <= 0:
            return start, j
    die("bathroom 板块没有正常闭合")


def render_case(c, indent):
    sp = " " * indent
    out = [sp + "{", sp + "  pano: true,"]
    for k in ("id", "title", "meta", "brand", "series", "price", "priceNote", "desc", "date"):
        if c.get(k):
            out.append(sp + "  %s: %s," % (k, jsstr(c[k])))
    if c.get("tags"):
        out.append(sp + "  tags: [" + ", ".join(jsstr(t) for t in c["tags"]) + "],")
    out.append(sp + "  image: %s," % jsstr(c["image"]))
    out.append(sp + "  thumb: %s" % jsstr(c["thumb"]))
    out.append(sp + "}")
    return out


def jsstr(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def ensure_trailing_comma(lines, idx):
    """插入点 idx 之前，让上一个非空行以逗号结尾（否则与前一个兄弟节点语法粘连）"""
    j = idx - 1
    while j >= 0 and not lines[j].strip():
        j -= 1
    if j >= 0 and not lines[j].rstrip().endswith(","):
        lines[j] = lines[j].rstrip() + ","


def insert_case(site, prov, city, c, dry):
    p = os.path.join(site, "js", "case-gallery-data.js")
    raw = open(p, encoding="utf-8").read()
    lines = raw.split("\n")
    s, e = bathroom_block_span(lines)

    pa, pname, ca, cname = prov, city[0], city[1], city[2]

    # 定位省份行（adcode 或名称）
    prov_i = None
    for i in range(s, e + 1):
        m = re.match(r"^(\s*)'(\d{6})': \{ name: '([^']+)', cities: \{", lines[i])
        if m and (m.group(2) == pa or m.group(3) == pname):
            prov_i = i
            break

    if prov_i is None:
        # ---- 新建省份节点（必须插在 provinces: {} 内部，不是 bathroom 块尾）----
        plist_i = None
        for j in range(s, e + 1):
            if re.match(r"^\s*provinces:\s*\{", lines[j]):
                plist_i = j
                break
        if plist_i is None:
            die("bathroom 板块里没找到 provinces: {")
        depth = lines[plist_i].count("{") - lines[plist_i].count("}")
        ins_at = None
        for j in range(plist_i + 1, e + 1):
            depth += lines[j].count("{") - lines[j].count("}")
            if depth <= 0:
                ins_at = j
                break
        if ins_at is None:
            die("没找到 provinces 列表的结尾")
        pl = ["      '%s': { name: '%s', cities: {" % (pa, pname),
              "        '%s': { name: '%s', cases: [" % (ca, cname)]
        pl += render_case(c, 10)
        pl += ["        ] }", "      } }"]
        ensure_trailing_comma(lines, ins_at)
        new = lines[:ins_at] + pl + lines[ins_at:]
        print("  新建省份节点 %s / 新建城市节点 %s" % (pname, cname))
    else:
        # 在省份块内找城市行
        depth = lines[prov_i].count("{") - lines[prov_i].count("}")
        city_i, prov_end = None, None
        for j in range(prov_i + 1, e + 1):
            depth += lines[j].count("{") - lines[j].count("}")
            if depth <= 0:
                prov_end = j
                break
            m = re.match(r"^(\s*)'(\d{6})': \{ name: '([^']+)', cases: \[", lines[j])
            if m and m.group(2) == ca:
                city_i = j

        if city_i is None:
            # ---- 省份在，城市不在：在省份末尾前插入城市节点 ----
            ind = " " * 8
            ins = [ind + "'%s': { name: '%s', cases: [" % (ca, cname)]
            ins += render_case(c, 10)
            ins += [ind + "] }"]
            ensure_trailing_comma(lines, prov_end)
            new = lines[:prov_end] + ins + lines[prov_end:]
            print("  省份 %s 已存在，新增城市节点 %s (%s)" % (pname, cname, ca))
        else:
            # ---- 城市在：向 cases 数组追加 ----
            ind = (len(lines[city_i]) - len(lines[city_i].lstrip())) + 2
            k = city_i + 1
            while k <= e and not re.match(r"^\s*\] \}", lines[k]):
                k += 1
            if k > e:
                die("没找到城市 %s 的 cases 数组结尾" % cname)
            prev = k - 1
            while prev > city_i and not lines[prev].strip():
                prev -= 1
            if not lines[prev].rstrip().endswith(","):
                lines[prev] = lines[prev].rstrip() + ","
            new = lines[:k] + render_case(c, ind) + lines[k:]
            print("  城市 %s 已存在，向 cases 追加一条" % cname)

    out = "\n".join(new)
    if dry:
        print("  [dry-run] case-gallery-data.js 将增加 %d 行" % (len(new) - len(lines)))
        return
    shutil.copyfile(p, p + ".bak")
    open(p, "w", encoding="utf-8", newline="\n").write(out)
    print("  ✓ 已写入 %s（备份 %s.bak）" % (p, os.path.basename(p)))


def verify_structure(site, pa, ca, cid):
    """用 node 真跑一遍文件, 断言记录能被按 省→市→案例 路径取到。
    只做 node --check 不够: 插错层级时语法依然合法。"""
    p = os.path.join(site, "js", "case-gallery-data.js")
    script = (
        "const fs=require('fs'),vm=require('vm');"
        "const ctx={window:{}};vm.createContext(ctx);"
        "vm.runInContext(fs.readFileSync(%s,'utf8'),ctx);"
        "const P=ctx.window.CASE_GALLERY.bathroom.provinces;"
        "const pa=%s,ca=%s,cid=%s;"
        "const p=P[pa];if(!p)throw new Error('省份 '+pa+' 不在 provinces 内; 现有: '+Object.keys(P).join(','));"
        "const c=p.cities[ca];if(!c)throw new Error('城市 '+ca+' 不在 '+p.name+' 内');"
        "const cs=c.cases;if(!cs.some(x=>x.id===cid))throw new Error('案例 '+cid+' 不在 cases 内');"
        "const x=cs.find(y=>y.id===cid);"
        "if(!x.image||!x.thumb)throw new Error('image/thumb 缺失');"
        "console.log('  OK  '+p.name+' / '+c.name+'  ('+cs.length+' 个案例)  '+x.title+'  '+x.price+'  '+x.image);"
    ) % (json.dumps(p.replace("\\", "/")), json.dumps(pa), json.dumps(ca), json.dumps(cid))
    r = subprocess.run(["node", "-e", script], capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "").strip().split("\n")[0] + "\n")
        die("结构自检失败 —— 记录没有落在 provinces/%s/cities/%s/cases 里" % (pa, ca))
    print(r.stdout.rstrip())
    # 图片文件也要真存在
    for k in ("image", "thumb"):
        f = os.path.join(site, x_path(site, cid, k))
        if not os.path.isfile(f):
            die("%s 指向的文件不存在: %s" % (k, f))


_x_cache = {}


def x_path(site, cid, key):
    """从数据文件里读出该案例的 image/thumb 路径（相对站点）"""
    p = os.path.join(site, "js", "case-gallery-data.js")
    import re as _re
    txt = open(p, encoding="utf-8").read()
    m = _re.search(r"id:\s*'%s'.*?%s:\s*'([^']+)'" % (_re.escape(cid), key), txt, _re.S)
    return m.group(1) if m else "__missing__"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default=r"E:\自媒体账号阶段性成活\个人主页管理\elfDXiao.github.io")
    ap.add_argument("--panorama", required=True)
    ap.add_argument("--province", required=True)
    ap.add_argument("--city", required=True)
    ap.add_argument("--id", required=True)
    ap.add_argument("--image-name", required=True, help="不含扩展名, 如 spage-sz-01")
    ap.add_argument("--title", required=True)
    ap.add_argument("--brand")
    ap.add_argument("--series")
    ap.add_argument("--price", required=True)
    ap.add_argument("--price-note")
    ap.add_argument("--desc")
    ap.add_argument("--tags", help="逗号分隔")
    ap.add_argument("--date")
    ap.add_argument("--meta")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    site = a.site
    if not os.path.isdir(os.path.join(site, "js")):
        die("站点目录不对: " + site)

    print("== 1. 解析行政编码 ==")
    cd = load_city_data(site)
    pa, pname, ca, cname = resolve(cd, a.province, a.city)
    print("  %s (%s) / %s (%s)" % (pname, pa, cname, ca))

    print("== 2. 处理全景图 ==")
    out_dir = os.path.join(site, "img", "360")
    img, thumb = make_images(a.panorama, out_dir, a.image_name, a.dry_run)

    print("== 3. 写入案例 ==")
    case = {
        "id": a.id, "title": a.title, "meta": a.meta, "brand": a.brand, "series": a.series,
        "price": a.price, "priceNote": a.price_note, "desc": a.desc,
        "tags": [t.strip() for t in a.tags.split(",") if t.strip()] if a.tags else None,
        "date": a.date, "image": img, "thumb": thumb,
    }
    insert_case(site, pa, (pname, ca, cname), case, a.dry_run)

    if not a.dry_run:
        print("== 4. 结构自检 ==")
        verify_structure(site, pa, ca, a.id)

    print()
    if a.dry_run:
        print("  dry-run 结束，未改动任何文件。去掉 --dry-run 执行。")
    else:
        print("  完成。下一步：本地预览确认，然后 git add/commit/push。")


if __name__ == "__main__":
    main()