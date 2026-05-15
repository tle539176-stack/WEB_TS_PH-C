$ErrorActionPreference = 'Stop'
$baseUrl = 'http://localhost:3001'

# ---- Authenticate ----
Write-Host "Dang nhap..." -ForegroundColor Cyan
$auth = Invoke-RestMethod -Uri "$baseUrl/api/auth/sign-in" -Method POST `
  -Body (@{email='admin@example.com';password='AdminTest123'} | ConvertTo-Json) `
  -ContentType 'application/json'
$token = $auth.session.access_token
$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

function Invoke-DB($payload) {
  $body = $payload | ConvertTo-Json -Depth 10 -Compress
  $result = Invoke-RestMethod -Uri "$baseUrl/api/db/query" -Method POST -Body $body -Headers $headers
  return $result
}

# ---- Category IDs ----
$catChongLaoHoa = 'e0563621-cb43-4caf-be46-32cc5c9bf042'
$catThucPhamBoSung = '6f7f92f8-3965-46ac-b1b9-56b981aa06c2'
$catDinhDuong = '50730030-336f-4786-a631-7e83d940cb8d'
$catDaChongNang = '5b9e1f0b-3c98-4734-9f14-7370b4916be5'

# ============================================================
# 1. Tao them 2 bai viet "Chong lao hoa" de test Related Notes
# ============================================================
Write-Host "`nTao bai viet demo..." -ForegroundColor Yellow

$notesDemoData = @(
  @{
    title = "NMN va NAD+: co che chong lao hoa tu cap te bao"
    slug = "nmn-va-nad-co-che-chong-lao-hoa-tu-cap-te-bao"
    excerpt = "NMN (Nicotinamide Mononucleotide) la tien chat cua NAD+, mot phan tu thiet yeu giup te bao san sinh nang luong va sua chua DNA. Bai viet phan tich co che hoat dong va bang chung khoa hoc hien tai."
    content = @"
<h2>NAD+ la gi va tai sao no quan trong?</h2>
<p>NAD+ (Nicotinamide Adenine Dinucleotide) la mot coenzyme hien dien trong moi te bao song. No dong vai tro thiet yeu trong chuyen hoa nang luong, sua chua DNA va dieu hoa hoat dong cua sirtuin - nhom protein lien quan den tuoi tho.</p>
<p>Khi chung ta gia di, muc NAD+ giam dan - co the giam den 50% o tuoi 40-60 so voi tuoi 20. Su suy giam nay lien quan den nhieu dau hieu lao hoa: moi met, giam tri nho, da nhan nheo va tang nguy co benh man tinh.</p>

<h2>NMN - Tien chat hieu qua cua NAD+</h2>
<p>NMN (Nicotinamide Mononucleotide) la mot nucleotide tu nhien, la tien chat truc tiep cua NAD+. Khi bo sung NMN, co the chuyen hoa no thanh NAD+ thong qua enzyme NMNAT.</p>
<p>Cac nghien cuu tren dong vat cho thay NMN co the:</p>
<ul>
<li>Tang muc NAD+ trong cac mo</li>
<li>Cai thien chuc nang ty the</li>
<li>Tang do nhay insulin</li>
<li>Bao ve tim mach</li>
<li>Cai thien chuc nang nhan thuc</li>
</ul>

<h2>Lieu luong va cach su dung</h2>
<p>Cac nghien cuu lam sang hien tai su dung lieu NMN tu 250mg den 1200mg/ngay. Phan lon chuyen gia khuyen nghi bat dau voi 250-500mg/ngay va tang dan theo dap ung cua co the.</p>
<p>NMN nen uong vao buoi sang, truoc bua an de tang sinh kha dung. Bao quan noi mat, tranh anh sang truc tiep.</p>

<h2>Luu y quan trong</h2>
<p>NMN khong phai la thuoc va chua duoc FDA phe duyet de dieu tri benh. Nguoi dung nen:</p>
<ul>
<li>Tham khao y kien bac si truoc khi su dung</li>
<li>Chon san pham co chung nhan chat luong</li>
<li>Theo doi phan ung cua co the</li>
</ul>
"@
    category_id = $catChongLaoHoa
    cover_image_url = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=600&fit=crop"
    cover_alt = "NMN va NAD+ chong lao hoa"
    read_time = "6 phut"
    status = "published"
    published_at = "2026-04-28T08:00:00Z"
    sources = @()
  },
  @{
    title = "Resveratrol va Quercetin: hai hoat chat chong oxy hoa manh tu thuc vat"
    slug = "resveratrol-va-quercetin-hai-hoat-chat-chong-oxy-hoa-manh-tu-thuc-vat"
    excerpt = "Resveratrol va Quercetin la hai polyphenol tu nhien duoc nghien cuu nhieu trong linh vuc chong lao hoa. Bai viet phan tich vai tro cua chung trong viec bao ve te bao va giam viem."
    content = @"
<h2>Resveratrol - Polyphenol tu nho do</h2>
<p>Resveratrol la mot polyphenol duoc tim thay nhieu trong vo nho do, viet quat va lac. No duoc biet den nhu mot chat kich hoat sirtuin - nhom protein giup bao ve te bao khoi lao hoa.</p>
<p>Cac loi ich chinh cua Resveratrol:</p>
<ul>
<li>Chong oxy hoa manh, trung hoa goc tu do</li>
<li>Giam viem man tinh</li>
<li>Bao ve he tim mach</li>
<li>Ho tro chuc nang nao bo</li>
</ul>

<h2>Quercetin - Flavonoid da nang</h2>
<p>Quercetin la mot flavonoid pho bien trong hanh, tao, tra xanh va bong cai xanh. No la mot trong nhung chat chong oxy hoa manh nhat tu thien nhien.</p>
<p>Dac biet, Quercetin con duoc nghien cuu nhu mot senolytic - chat co kha nang loai bo te bao gia (senescent cells), giup lam cham qua trinh lao hoa.</p>

<h2>Ket hop Resveratrol va Quercetin</h2>
<p>Nghien cuu gan day cho thay su ket hop giua Resveratrol va Quercetin co tac dung hiep dong, tang cuong hieu qua chong oxy hoa va chong viem hon khi su dung rieng le.</p>

<h2>Lieu luong khuyen nghi</h2>
<ul>
<li>Resveratrol: 150-500mg/ngay</li>
<li>Quercetin: 500-1000mg/ngay</li>
<li>Nen uong cung bua an co chat beo de tang hap thu</li>
</ul>
"@
    category_id = $catChongLaoHoa
    cover_image_url = "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=1200&h=600&fit=crop"
    cover_alt = "Resveratrol va Quercetin"
    read_time = "5 phut"
    status = "published"
    published_at = "2026-04-20T08:00:00Z"
    sources = @()
  }
)

foreach ($note in $notesDemoData) {
  # Check if already exists
  $check = Invoke-DB @{
    table = 'notes'; action = 'select'
    select = @{ columns = 'id'; options = @{} }
    filters = @(@{ operator = 'eq'; column = 'slug'; value = $note.slug })
    orders = @()
  }
  if ($check.data -and $check.data.Count -gt 0) {
    Write-Host "  [SKIP] Bai viet '$($note.slug)' da ton tai." -ForegroundColor Gray
    continue
  }

  $result = Invoke-DB @{
    table = 'notes'; action = 'insert'; values = $note
    select = @{ columns = 'id,title'; options = @{} }
    filters = @(); orders = @()
    returning = $true
  }
  Write-Host "  [OK] Tao bai viet: $($note.title)" -ForegroundColor Green
}

# ============================================================
# 2. Tao 4 san pham published voi hinh anh
# ============================================================
Write-Host "`nTao san pham demo..." -ForegroundColor Yellow

$productsDemoData = @(
  @{
    name = "NMN 500mg Premium"
    slug = "nmn-500mg-premium"
    brand = "Dr. Phuc Collection"
    price = 1200000
    tag = "Best Seller"
    short_description = "Bo sung NMN nguyen chat 500mg, ho tro tang NAD+ va chong lao hoa tu cap te bao."
    description = "<h2>NMN 500mg Premium</h2><p>San pham NMN nguyen chat duoc chiet xuat theo cong nghe enzyme sinh hoc, dam bao do tinh khiet tren 99%. Moi vien chua 500mg NMN (Nicotinamide Mononucleotide), ho tro tang muc NAD+ trong co the, giup cai thien nang luong, bao ve te bao va lam cham qua trinh lao hoa.</p><h3>Thanh phan</h3><ul><li>NMN (beta-Nicotinamide Mononucleotide): 500mg</li><li>Vo nang: HPMC (thuc vat)</li></ul><h3>Cong dung</h3><ul><li>Tang cuong nang luong te bao</li><li>Ho tro sua chua DNA</li><li>Cai thien chuc nang ty the</li><li>Bao ve tim mach</li></ul>"
    usage = "<p>Uong 1 vien/ngay vao buoi sang truoc bua an 30 phut. Bao quan noi kho mat, duoi 25 do C.</p>"
    warnings = "<p>Khong su dung cho phu nu mang thai, dang cho con bu. Tham khao y kien bac si truoc khi su dung.</p>"
    status = "published"
    published_at = "2026-04-15T08:00:00Z"
    imageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop"
  },
  @{
    name = "Collagen Peptide Plus"
    slug = "collagen-peptide-plus"
    brand = "Dr. Phuc Collection"
    price = 890000
    tag = "Khuyen nghi"
    short_description = "Collagen thuy phan ket hop Vitamin C va Khoang chat, ho tro da dep va xuong khoe."
    description = "<h2>Collagen Peptide Plus</h2><p>Cong thuc collagen thuy phan tien tien, ket hop cac peptide collagen Type I va Type III tu ca bien, cung voi Vitamin C, Kem va Biotin giup tang cuong san xuat collagen tu nhien cua co the.</p><h3>Cong dung</h3><ul><li>Giam nep nhan, tang do dan hoi da</li><li>Ho tro xuong khop khoe manh</li><li>Cai thien mong toc</li><li>Tang cuong mien dich</li></ul>"
    usage = "<p>Pha 1 goi (10g) voi 200ml nuoc am hoac nuoc ep trai cay. Uong 1 goi/ngay.</p>"
    warnings = "<p>Khong su dung neu di ung voi thanh phan tu ca bien.</p>"
    status = "published"
    published_at = "2026-04-10T08:00:00Z"
    imageUrl = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop"
  },
  @{
    name = "Omega-3 Fish Oil 1000mg"
    slug = "omega-3-fish-oil-1000mg"
    brand = "Dr. Phuc Collection"
    price = 650000
    tag = "Hot"
    short_description = "Dau ca Omega-3 nguyen chat tu ca hoi Alaska, giau EPA va DHA cho tim mach va nao bo."
    description = "<h2>Omega-3 Fish Oil 1000mg</h2><p>Dau ca Omega-3 duoc chiet xuat tu ca hoi hoang da Alaska, chua ham luong cao EPA (600mg) va DHA (400mg). San pham duoc tinh che bang cong nghe chung cat phan tu, loai bo kim loai nang va tap chat.</p><h3>Cong dung</h3><ul><li>Ho tro suc khoe tim mach</li><li>Cai thien chuc nang nao va tri nho</li><li>Giam viem khop</li><li>Bao ve mat</li></ul>"
    usage = "<p>Uong 1-2 vien/ngay trong bua an. Bao quan noi mat.</p>"
    warnings = "<p>Than trong khi su dung cung thuoc chong dong mau. Tham khao y kien bac si.</p>"
    status = "published"
    published_at = "2026-04-05T08:00:00Z"
    imageUrl = "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=600&fit=crop"
  },
  @{
    name = "Kem chong nang SPF50+ PA+++"
    slug = "kem-chong-nang-spf50-pa"
    brand = "Dr. Phuc Derm"
    price = 480000
    tag = "Moi"
    short_description = "Kem chong nang pho rong SPF50+ PA+++ ket hop chong lao hoa, phu hop moi loai da."
    description = "<h2>Kem Chong Nang SPF50+ PA+++</h2><p>Cong thuc chong nang the he moi ket hop ca bo loc hoa hoc va vat ly, bao ve da toan dien truoc tia UVA va UVB. Them thanh phan chong lao hoa Niacinamide va Vitamin E giup nuoi duong da trong khi bao ve.</p><h3>Dac diem</h3><ul><li>SPF50+ / PA+++</li><li>Khong gay bong nhon, tone da tu nhien</li><li>Phu hop moi loai da, ke ca da nhay cam</li><li>Khong chua Paraben, khong huong lieu</li></ul>"
    usage = "<p>Thoa deu len mat va co truoc khi ra nang 15 phut. Thoa lai sau moi 2 gio khi o ngoai troi.</p>"
    warnings = "<p>Tranh tiep xuc voi mat. Ngung su dung neu co dau hieu kich ung.</p>"
    status = "published"
    published_at = "2026-04-01T08:00:00Z"
    imageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop"
  }
)

foreach ($prod in $productsDemoData) {
  $imageUrl = $prod.imageUrl
  $prod.Remove('imageUrl')

  # Check if product already exists
  $check = Invoke-DB @{
    table = 'products'; action = 'select'
    select = @{ columns = 'id'; options = @{} }
    filters = @(@{ operator = 'eq'; column = 'slug'; value = $prod.slug })
    orders = @()
  }
  if ($check.data -and $check.data.Count -gt 0) {
    Write-Host "  [SKIP] San pham '$($prod.slug)' da ton tai." -ForegroundColor Gray
    continue
  }

  $result = Invoke-DB @{
    table = 'products'; action = 'insert'; values = $prod
    select = @{ columns = 'id,name'; options = @{} }
    filters = @(); orders = @()
    returning = $true
  }
  $productId = $result.data.id
  Write-Host "  [OK] Tao san pham: $($prod.name) (ID: $productId)" -ForegroundColor Green

  # Add product image
  if ($productId -and $imageUrl) {
    $imgResult = Invoke-DB @{
      table = 'product_images'; action = 'insert'
      values = @{
        product_id = $productId
        url = $imageUrl
        alt = $prod.name
        sort_order = 0
        is_primary = $true
      }
      select = @{ columns = 'id'; options = @{} }
      filters = @(); orders = @()
      returning = $true
    }
    Write-Host "    [OK] Them anh cho san pham" -ForegroundColor DarkGreen
  }
}

Write-Host "`nHoan tat! Refresh trang localhost:3001 de kiem tra." -ForegroundColor Cyan
