-- ============================================================
-- Migration 006: Seed anti-aging notes for homepage/Admin linkage
-- Additive and idempotent: seeded notes are inserted only if slug is missing.
-- ============================================================

insert into people (
  display_name,
  slug,
  role,
  professional_title,
  credentials,
  specialties,
  bio,
  is_public,
  is_active
)
values (
  'Tiến sĩ Đặng Hữu Phúc',
  'tien-si-dang-huu-phuc',
  'admin',
  'Tiến sĩ Y khoa',
  'TS',
  array['Chống lão hóa', 'Y học dự phòng', 'Giáo dục sức khỏe'],
  'Người phụ trách hệ thống nội dung giáo dục sức khỏe và chống lão hóa.',
  true,
  true
)
on conflict (slug) do update
set display_name = excluded.display_name,
    role = excluded.role,
    professional_title = excluded.professional_title,
    credentials = excluded.credentials,
    specialties = excluded.specialties,
    bio = excluded.bio,
    is_public = excluded.is_public,
    is_active = excluded.is_active,
    updated_at = now();

insert into categories (
  name,
  slug,
  description,
  type,
  sort_order,
  seo_title,
  seo_description,
  is_active
)
values
  ('Chống lão hóa', 'chong-lao-hoa', 'Các ghi chú nền tảng về giấc ngủ, nhịp sinh học, vận động và lối sống lành mạnh.', 'note', 10, 'Chống lão hóa', 'Kiến thức chống lão hóa dựa trên nền tảng y học dự phòng và lối sống.', true),
  ('Thực phẩm bổ sung', 'thuc-pham-bo-sung', 'Cách đọc hiểu bằng chứng, lợi ích và điểm cần thận trọng khi dùng thực phẩm bổ sung.', 'note', 20, 'Thực phẩm bổ sung', 'Ghi chú giúp dùng thực phẩm bổ sung thận trọng và có trao đổi với nhân viên y tế.', true),
  ('Dinh dưỡng', 'dinh-duong', 'Các nguyên tắc ăn uống thực hành để bảo vệ cơ, chuyển hóa và sức khỏe lâu dài.', 'note', 30, 'Dinh dưỡng', 'Kiến thức dinh dưỡng dễ hiểu cho người trưởng thành và người trung niên.', true),
  ('Da và chống nắng', 'da-va-chong-nang', 'Kiến thức chăm sóc da, chống nắng và giảm các hiểu lầm thường gặp.', 'note', 40, 'Da và chống nắng', 'Hướng dẫn chống nắng và chăm sóc da theo hướng giáo dục sức khỏe.', true),
  ('Tầm soát sức khỏe', 'tam-soat-suc-khoe', 'Cách chuẩn bị trước khi khám, theo dõi chỉ số và trao đổi với bác sĩ hiệu quả hơn.', 'note', 50, 'Tầm soát sức khỏe', 'Ghi chú về tầm soát sức khỏe định kỳ và chuẩn bị câu hỏi khi đi khám.', true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    type = excluded.type,
    sort_order = excluded.sort_order,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    is_active = excluded.is_active,
    updated_at = now();

with seed_notes as (
  select *
  from (
    values
      (
        'chong-lao-hoa-bat-dau-tu-giac-ngu-va-nhip-sinh-hoc',
        'Chống lão hóa bắt đầu từ giấc ngủ và nhịp sinh học',
        'Giấc ngủ, ánh sáng buổi sáng và lịch sinh hoạt đều đặn là nền tảng quan trọng cho sức khỏe lâu dài.',
        $sleep$
<h2>Tóm tắt thực hành</h2>
<p>Trong chống lão hóa, giấc ngủ không nên được xem là phần phụ của sức khỏe. Đây là thời gian cơ thể điều chỉnh nhịp sinh học, phục hồi năng lượng, củng cố trí nhớ và hỗ trợ các hệ thống chuyển hóa hoạt động ổn định hơn. Khi giấc ngủ bị rút ngắn kéo dài, người đọc thường thấy mệt mỏi, giảm tập trung, dễ ăn lệch bữa và khó duy trì vận động.</p>
<h2>Nhịp sinh học quan trọng ở điểm nào?</h2>
<p>Nhịp sinh học là đồng hồ bên trong giúp cơ thể biết lúc nào nên tỉnh táo, lúc nào nên nghỉ ngơi. Ánh sáng ban ngày, giờ ăn, vận động và thời điểm dùng thiết bị điện tử đều có thể tác động đến đồng hồ này. Một lịch sinh hoạt ổn định thường dễ duy trì hơn các thay đổi quá mạnh trong thời gian ngắn.</p>
<ul>
  <li>Ưu tiên giờ ngủ và giờ thức tương đối cố định, kể cả cuối tuần.</li>
  <li>Tiếp xúc ánh sáng tự nhiên vào buổi sáng nếu điều kiện cho phép.</li>
  <li>Giảm ánh sáng mạnh và màn hình gần giờ ngủ để cơ thể dễ chuyển sang trạng thái nghỉ.</li>
  <li>Tránh dùng rượu như một cách ép cơ thể ngủ, vì chất lượng giấc ngủ có thể bị ảnh hưởng.</li>
</ul>
<h2>Khi nào cần trao đổi với bác sĩ?</h2>
<p>Nếu mất ngủ kéo dài, ngủ ngáy to kèm ngưng thở, buồn ngủ quá mức ban ngày, hoặc phải dùng thuốc ngủ thường xuyên, người đọc nên trao đổi trực tiếp với bác sĩ. Mục tiêu không phải chỉ là ngủ nhiều hơn, mà là tìm nguyên nhân và xây lại chất lượng giấc ngủ một cách an toàn.</p>
        $sleep$,
        'chong-lao-hoa',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
        'Người đang nghỉ ngơi trong không gian yên tĩnh, gợi nhắc vai trò của giấc ngủ với sức khỏe.',
        '4 phút',
        'Chống lão hóa bắt đầu từ giấc ngủ và nhịp sinh học',
        'Giấc ngủ, ánh sáng và lịch sinh hoạt đều đặn giúp xây nền sức khỏe lâu dài theo hướng chống lão hóa.',
        'Y học dự phòng',
        '2026-05-01 08:00:00+07'::timestamptz,
        '2027-05-01 08:00:00+07'::timestamptz,
        640,
        'Dễ đọc'
      ),
      (
        'omega-3-khi-nao-nen-bo-sung-va-khi-nao-can-than-trong',
        'Omega-3: khi nào nên bổ sung và khi nào cần thận trọng',
        'Omega-3 có thể hữu ích trong một số bối cảnh, nhưng cần đọc đúng liều, nguồn gốc và nguy cơ tương tác.',
        $omega$
<h2>Tóm tắt thực hành</h2>
<p>Omega-3 là nhóm acid béo thường được nhắc đến trong chăm sóc tim mạch, viêm và sức khỏe chuyển hóa. Tuy vậy, việc bổ sung không nên bắt đầu từ tâm lý càng nhiều càng tốt. Người đọc cần phân biệt giữa omega-3 từ thực phẩm, như cá béo, và omega-3 dạng viên uống có hàm lượng EPA/DHA khác nhau.</p>
<h2>Đọc nhãn trước khi dùng</h2>
<p>Điểm quan trọng trên nhãn không chỉ là số miligam dầu cá tổng, mà là lượng EPA và DHA. Hai sản phẩm có cùng lượng dầu cá có thể khác nhau đáng kể về hoạt chất thật sự. Người đang dùng thuốc chống đông, có rối loạn chảy máu, chuẩn bị phẫu thuật, đang mang thai hoặc có bệnh mạn tính nên hỏi bác sĩ trước khi dùng liều cao.</p>
<ul>
  <li>Ưu tiên chế độ ăn cân bằng trước khi nghĩ đến viên bổ sung.</li>
  <li>Không tự dùng liều cao để thay thế thuốc điều trị.</li>
  <li>Kiểm tra nguồn gốc, hạn dùng, hàm lượng EPA/DHA và khuyến cáo bảo quản.</li>
  <li>Ngưng và hỏi nhân viên y tế nếu có dấu hiệu bất thường như dị ứng, rối loạn tiêu hóa nặng hoặc bầm chảy máu dễ hơn.</li>
</ul>
<h2>Gợi ý trao đổi với bác sĩ</h2>
<p>Trước khi mua sản phẩm, hãy chuẩn bị ba câu hỏi: mình có thật sự thiếu hoặc có chỉ định không, liều phù hợp với tình trạng sức khỏe là bao nhiêu, và sản phẩm này có tương tác với thuốc đang dùng không. Cách tiếp cận này giúp thực phẩm bổ sung trở thành công cụ hỗ trợ có kiểm soát thay vì một quyết định cảm tính.</p>
        $omega$,
        'thuc-pham-bo-sung',
        'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1200&auto=format&fit=crop',
        'Viên nang bổ sung dinh dưỡng đặt cạnh thực phẩm lành mạnh.',
        '4 phút',
        'Omega-3: khi nào nên bổ sung và khi nào cần thận trọng',
        'Ghi chú giúp đọc đúng omega-3, hiểu liều dùng, lợi ích và điểm cần hỏi bác sĩ trước khi bổ sung.',
        'Dinh dưỡng và thực phẩm bổ sung',
        '2026-04-24 08:00:00+07'::timestamptz,
        '2027-04-24 08:00:00+07'::timestamptz,
        610,
        'Dễ đọc'
      ),
      (
        'protein-sau-tuoi-40-an-bao-nhieu-la-vua-du',
        'Protein sau tuổi 40: ăn bao nhiêu là vừa đủ',
        'Sau tuổi 40, protein cần được phân bổ đều trong ngày để hỗ trợ khối cơ, vận động và chuyển hóa.',
        $protein$
<h2>Tóm tắt thực hành</h2>
<p>Sau tuổi trung niên, cơ thể có xu hướng mất khối cơ nếu ăn uống thiếu cân đối, ít vận động hoặc có bệnh mạn tính. Protein không phải là chất dành riêng cho người tập gym; đây là vật liệu cần thiết để duy trì cơ, miễn dịch và khả năng hồi phục sau bệnh. Vấn đề thực hành là ăn đủ, chia hợp lý và phù hợp với bệnh nền.</p>
<h2>Không chỉ nhìn tổng số trong ngày</h2>
<p>Nhiều người ăn rất ít protein vào bữa sáng, ăn vừa phải vào bữa trưa và dồn nhiều vào bữa tối. Cách chia này có thể không tối ưu với người lớn tuổi hoặc người đang muốn giữ cơ. Một cách dễ áp dụng hơn là đưa nguồn protein tốt vào mỗi bữa chính: cá, trứng, sữa chua, đậu, thịt nạc, đậu phụ hoặc các lựa chọn phù hợp văn hóa ăn uống của từng gia đình.</p>
<ul>
  <li>Kết hợp protein với tập kháng lực nhẹ, đi bộ và ngủ đủ để hỗ trợ cơ.</li>
  <li>Ưu tiên thực phẩm thật trước khi dùng bột protein.</li>
  <li>Người có bệnh thận, gan hoặc đang điều trị bệnh mạn tính cần hỏi bác sĩ về lượng phù hợp.</li>
  <li>Theo dõi cân nặng, sức cơ và mức vận động thay vì chỉ nhìn con số trên cân.</li>
</ul>
<h2>Câu hỏi nên chuẩn bị</h2>
<p>Khi đi khám, người đọc có thể hỏi: cân nặng và bệnh nền của tôi có cần giới hạn protein không, tôi nên chia protein trong ngày thế nào, và có cần xét nghiệm gì trước khi thay đổi chế độ ăn không. Với chống lão hóa, mục tiêu là giữ cơ và sức bền bằng thói quen bền vững, không chạy theo một công thức cứng cho mọi người.</p>
        $protein$,
        'dinh-duong',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
        'Bữa ăn cân bằng với các nhóm thực phẩm giàu dinh dưỡng.',
        '4 phút',
        'Protein sau tuổi 40: ăn bao nhiêu là vừa đủ',
        'Cách hiểu protein sau tuổi 40 để hỗ trợ khối cơ, vận động và sức khỏe chuyển hóa lâu dài.',
        'Dinh dưỡng',
        '2026-04-18 08:00:00+07'::timestamptz,
        '2027-04-18 08:00:00+07'::timestamptz,
        620,
        'Dễ đọc'
      ),
      (
        'chong-nang-dung-cach-spf-pa-va-nhung-hieu-lam-thuong-gap',
        'Chống nắng đúng cách: SPF, PA và những hiểu lầm thường gặp',
        'Chống nắng hiệu quả cần đủ lượng, bôi lại đúng lúc và kết hợp che chắn, không chỉ nhìn con số SPF.',
        $sunscreen$
<h2>Tóm tắt thực hành</h2>
<p>Chống nắng là một trong những thói quen dễ làm nhưng cũng dễ làm thiếu. SPF cao không có nghĩa là có thể bôi rất ít, bôi một lần rồi ở ngoài trời cả ngày. Tia UV có thể góp phần gây lão hóa da, sạm nám và tăng nguy cơ tổn thương da, vì vậy chống nắng nên là một hệ thống gồm sản phẩm, che chắn và hành vi.</p>
<h2>Hiểu SPF và cách dùng thực tế</h2>
<p>SPF chủ yếu phản ánh khả năng bảo vệ trước UVB trong điều kiện thử nghiệm. Trong đời sống, hiệu quả phụ thuộc vào lượng bôi, vị trí bỏ sót, mồ hôi, nước và thời gian ở ngoài trời. Người đọc nên chọn sản phẩm phù hợp loại da, dễ dùng hằng ngày và có thể bôi lại khi cần.</p>
<ul>
  <li>Bôi đủ lượng cho vùng da phơi nắng, gồm mặt, cổ, tai và mu bàn tay.</li>
  <li>Bôi lại sau khi ra mồ hôi nhiều, bơi hoặc lau khô bằng khăn.</li>
  <li>Kết hợp mũ, kính, áo chống nắng và tránh nắng gắt khi có thể.</li>
  <li>Da nhạy cảm, đang điều trị da liễu hoặc có tiền sử ung thư da nên hỏi bác sĩ da liễu.</li>
</ul>
<h2>Hiểu lầm thường gặp</h2>
<p>Trời râm không đồng nghĩa với không cần chống nắng. Trang điểm có SPF cũng thường không đủ nếu lượng dùng quá ít. Một sản phẩm tốt là sản phẩm được dùng đều, đúng cách và không gây khó chịu khiến người dùng bỏ cuộc sau vài ngày.</p>
        $sunscreen$,
        'da-va-chong-nang',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop',
        'Sản phẩm chăm sóc da và chống nắng trong ánh sáng tự nhiên.',
        '4 phút',
        'Chống nắng đúng cách: SPF, PA và những hiểu lầm thường gặp',
        'Cách đọc SPF và xây dựng thói quen chống nắng thực tế để hỗ trợ sức khỏe làn da lâu dài.',
        'Da liễu dự phòng',
        '2026-04-10 08:00:00+07'::timestamptz,
        '2027-04-10 08:00:00+07'::timestamptz,
        610,
        'Dễ đọc'
      ),
      (
        'tam-soat-suc-khoe-dinh-ky-nen-chuan-bi-cau-hoi-gi',
        'Tầm soát sức khỏe định kỳ: nên chuẩn bị câu hỏi gì',
        'Chuẩn bị câu hỏi trước khi khám giúp buổi tầm soát rõ mục tiêu hơn và tránh bỏ sót thông tin quan trọng.',
        $screening$
<h2>Tóm tắt thực hành</h2>
<p>Tầm soát sức khỏe không phải là làm càng nhiều xét nghiệm càng tốt. Mục tiêu là chọn đúng kiểm tra phù hợp với tuổi, giới, tiền sử gia đình, bệnh nền, thuốc đang dùng và nguy cơ cá nhân. Một buổi khám hiệu quả thường bắt đầu từ việc người bệnh chuẩn bị thông tin rõ ràng.</p>
<h2>Trước khi đi khám nên ghi lại gì?</h2>
<p>Người đọc nên mang danh sách thuốc, thực phẩm bổ sung, bệnh đã từng mắc, kết quả xét nghiệm cũ và câu hỏi đang lo lắng. Với người có gia đình từng mắc bệnh tim mạch, đái tháo đường, ung thư đại trực tràng hoặc tăng huyết áp, phần tiền sử gia đình nên được ghi cụ thể tuổi phát hiện bệnh nếu biết.</p>
<ul>
  <li>Hỏi bác sĩ: xét nghiệm nào thật sự phù hợp với tuổi và nguy cơ của tôi?</li>
  <li>Hỏi: chỉ số nào cần theo dõi tại nhà, ví dụ huyết áp, cân nặng, vòng eo hoặc đường huyết?</li>
  <li>Hỏi: khi nào cần quay lại, và dấu hiệu nào cần đi khám sớm hơn?</li>
  <li>Không tự diễn giải một chỉ số đơn lẻ nếu chưa đặt trong bối cảnh sức khỏe tổng thể.</li>
</ul>
<h2>Sau buổi khám</h2>
<p>Hãy lưu kết quả theo thời gian để thấy xu hướng, không chỉ nhìn một lần đo. Nếu bác sĩ hẹn kiểm tra lại, việc quay lại đúng hẹn quan trọng không kém xét nghiệm ban đầu. Tầm soát tốt là quá trình có theo dõi, giải thích và hành động phù hợp.</p>
        $screening$,
        'tam-soat-suc-khoe',
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop',
        'Bác sĩ trao đổi với người bệnh trong buổi tư vấn sức khỏe.',
        '4 phút',
        'Tầm soát sức khỏe định kỳ: nên chuẩn bị câu hỏi gì',
        'Danh sách câu hỏi giúp người đọc chuẩn bị tốt hơn trước khi đi khám và tầm soát sức khỏe định kỳ.',
        'Y học dự phòng',
        '2026-04-02 08:00:00+07'::timestamptz,
        '2027-04-02 08:00:00+07'::timestamptz,
        600,
        'Dễ đọc'
      )
  ) as v(
    slug,
    title,
    excerpt,
    content,
    category_slug,
    cover_image_url,
    cover_alt,
    read_time,
    seo_title,
    seo_description,
    medical_specialty,
    published_at,
    next_review_at,
    word_count,
    reading_level
  )
)
insert into notes (
  title,
  slug,
  excerpt,
  content,
  category_id,
  cover_image_url,
  cover_alt,
  read_time,
  status,
  sources,
  seo_title,
  seo_description,
  author_id,
  reviewed_by_id,
  reviewed_at,
  next_review_at,
  medical_specialty,
  medical_audience,
  disclaimer_ack,
  schema_type,
  word_count,
  reading_level,
  published_at
)
select
  s.title,
  s.slug,
  s.excerpt,
  s.content,
  c.id,
  s.cover_image_url,
  s.cover_alt,
  s.read_time,
  'published'::content_status,
  '[]'::jsonb,
  s.seo_title,
  s.seo_description,
  p.id,
  p.id,
  s.published_at,
  s.next_review_at,
  s.medical_specialty,
  'Patient',
  true,
  'MedicalWebPage',
  s.word_count,
  s.reading_level,
  s.published_at
from seed_notes s
join categories c on c.slug = s.category_slug
left join people p on p.slug = 'tien-si-dang-huu-phuc'
on conflict (slug) do nothing;

update note_sources ns
set title = 'Nutrition for Older Adults',
    url = 'https://medlineplus.gov/nutritionforolderadults.html',
    publisher = 'MedlinePlus',
    source_type = 'government',
    doi = null,
    pmid = null,
    published_at = null,
    accessed_at = '2026-05-13'::date,
    evidence_level = 'moderate',
    updated_at = now()
from notes n
where ns.note_id = n.id
  and n.slug = 'protein-sau-tuoi-40-an-bao-nhieu-la-vua-du'
  and ns.title = 'Protein and Older Adults'
  and ns.url = 'https://www.nia.nih.gov/health/healthy-eating-nutrition-and-diet/protein-and-older-adults';

with seed_sources as (
  select *
  from (
    values
      ('chong-lao-hoa-bat-dau-tu-giac-ngu-va-nhip-sinh-hoc', 'About Sleep', 'https://www.cdc.gov/sleep/about/index.html', 'Centers for Disease Control and Prevention', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 0),
      ('chong-lao-hoa-bat-dau-tu-giac-ngu-va-nhip-sinh-hoc', 'Sleep disorders in older adults', 'https://medlineplus.gov/ency/article/000064.htm', 'MedlinePlus', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 1),
      ('omega-3-khi-nao-nen-bo-sung-va-khi-nao-can-than-trong', 'Omega-3 Fatty Acids - Health Professional Fact Sheet', 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/', 'NIH Office of Dietary Supplements', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 0),
      ('omega-3-khi-nao-nen-bo-sung-va-khi-nao-can-than-trong', 'Omega-3 Supplements: What You Need To Know', 'https://www.nccih.nih.gov/health/omega3-supplements-what-you-need-to-know', 'National Center for Complementary and Integrative Health', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 1),
      ('protein-sau-tuoi-40-an-bao-nhieu-la-vua-du', 'Evidence-based recommendations for optimal dietary protein intake in older people: a position paper from the PROT-AGE Study Group', 'https://pubmed.ncbi.nlm.nih.gov/23867520/', 'Journal of the American Medical Directors Association', 'journal', '10.1016/j.jamda.2013.05.021', '23867520', '2013-08-01'::date, '2026-05-13'::date, 'moderate', 0),
      ('protein-sau-tuoi-40-an-bao-nhieu-la-vua-du', 'Nutrition for Older Adults', 'https://medlineplus.gov/nutritionforolderadults.html', 'MedlinePlus', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 1),
      ('chong-nang-dung-cach-spf-pa-va-nhung-hieu-lam-thuong-gap', 'Sun Safety Facts', 'https://www.cdc.gov/skin-cancer/sun-safety/index.html', 'Centers for Disease Control and Prevention', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 0),
      ('chong-nang-dung-cach-spf-pa-va-nhung-hieu-lam-thuong-gap', 'Sunscreen: How to Help Protect Your Skin from the Sun', 'https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun', 'U.S. Food and Drug Administration', 'government', null, null, null::date, '2026-05-13'::date, 'moderate', 1),
      ('tam-soat-suc-khoe-dinh-ky-nen-chuan-bi-cau-hoi-gi', 'Hypertension in Adults: Screening', 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening', 'U.S. Preventive Services Task Force', 'guideline', null, null, '2021-04-27'::date, '2026-05-13'::date, 'high', 0),
      ('tam-soat-suc-khoe-dinh-ky-nen-chuan-bi-cau-hoi-gi', 'Colorectal Cancer: Screening', 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening', 'U.S. Preventive Services Task Force', 'guideline', null, null, '2021-05-18'::date, '2026-05-13'::date, 'high', 1),
      ('tam-soat-suc-khoe-dinh-ky-nen-chuan-bi-cau-hoi-gi', 'Prediabetes and Type 2 Diabetes: Screening', 'https://www.uspreventiveservicestaskforce.org/uspstf/document/RecommendationStatementFinal/screening-for-prediabetes-and-type-2-diabetes', 'U.S. Preventive Services Task Force', 'guideline', null, null, '2021-08-24'::date, '2026-05-13'::date, 'high', 2)
  ) as v(note_slug, title, url, publisher, source_type, doi, pmid, published_at, accessed_at, evidence_level, sort_order)
)
insert into note_sources (
  note_id,
  title,
  url,
  publisher,
  source_type,
  doi,
  pmid,
  published_at,
  accessed_at,
  evidence_level,
  sort_order
)
select
  n.id,
  s.title,
  s.url,
  s.publisher,
  s.source_type,
  s.doi,
  s.pmid,
  s.published_at,
  s.accessed_at,
  s.evidence_level,
  s.sort_order
from seed_sources s
join notes n on n.slug = s.note_slug
where not exists (
  select 1
  from note_sources existing
  where existing.note_id = n.id
    and existing.title = s.title
    and existing.url = s.url
);

insert into content_reviews (
  entity_type,
  entity_id,
  reviewer_id,
  decision,
  review_scope,
  summary,
  evidence_notes,
  reviewed_at,
  next_review_at,
  created_by
)
select
  'note',
  n.id,
  p.id,
  'approved',
  'medical',
  'Seeded editorial review for homepage research notes.',
  'Nguồn tham khảo được lưu trong bảng note_sources.',
  n.reviewed_at,
  n.next_review_at,
  null
from notes n
left join people p on p.slug = 'tien-si-dang-huu-phuc'
where n.slug in (
  'chong-lao-hoa-bat-dau-tu-giac-ngu-va-nhip-sinh-hoc',
  'omega-3-khi-nao-nen-bo-sung-va-khi-nao-can-than-trong',
  'protein-sau-tuoi-40-an-bao-nhieu-la-vua-du',
  'chong-nang-dung-cach-spf-pa-va-nhung-hieu-lam-thuong-gap',
  'tam-soat-suc-khoe-dinh-ky-nen-chuan-bi-cau-hoi-gi'
)
and not exists (
  select 1
  from content_reviews existing
  where existing.entity_type = 'note'
    and existing.entity_id = n.id
    and existing.review_scope = 'medical'
    and existing.decision = 'approved'
);
