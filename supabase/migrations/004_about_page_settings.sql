-- Migration 004: About page settings for Dr. Dang Huu Phuc
-- Adds editable /about content to the settings key-value store.

insert into settings (key, value)
values (
  'about',
  jsonb_build_object(
    'aboutTitle', 'Tiến sĩ Đặng Hữu Phúc',
    'aboutSubtitle', 'Chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm',
    'aboutQuote', 'Kiến thức đúng giúp người đọc hiểu rõ hơn và ra quyết định sức khỏe thận trọng hơn.',
    'aboutSectionTitle', 'Giới thiệu',
    'aboutBody', 'Tiến sĩ Đặng Hữu Phúc xây dựng website này như một không gian chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng. Nội dung được trình bày theo hướng giáo dục sức khỏe, giúp người đọc hiểu vấn đề, chuẩn bị câu hỏi phù hợp và trao đổi hiệu quả hơn với nhân viên y tế.' || E'\n\n' || 'Các bài viết, ghi chú, sách và tài liệu trên website ưu tiên tính rõ ràng, thận trọng và minh bạch nguồn tham khảo. Thông tin không thay thế chẩn đoán hoặc điều trị trực tiếp; khi có triệu chứng hoặc vấn đề sức khỏe cụ thể, người đọc nên tham khảo ý kiến bác sĩ hoặc cơ sở y tế phù hợp.',
    'aboutHighlights', 'Giáo dục sức khỏe cộng đồng' || E'\n' || 'Kiến thức y khoa dễ hiểu' || E'\n' || 'Nội dung có nguồn tham khảo' || E'\n' || 'Khuyến khích thăm khám đúng lúc',
    'aboutImage', '',
    'aboutStoragePath', '',
    'aboutImageAlt', 'Tiến sĩ Đặng Hữu Phúc'
  )
)
on conflict (key) do update
set value = excluded.value || settings.value,
    updated_at = now();

update settings
set value = value
  || jsonb_build_object(
    'siteName', 'Tiến sĩ Đặng Hữu Phúc',
    'logoText', 'DP',
    'tagline', 'Kiến thức sức khỏe chính thống',
    'footerText', 'Website chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng.',
    'seoTitle', 'Tiến sĩ Đặng Hữu Phúc',
    'seoDescription', 'Website chia sẻ kiến thức sức khỏe, ghi chú, sách và nội dung tham khảo của Tiến sĩ Đặng Hữu Phúc.'
  ),
  updated_at = now()
where key = 'global'
  and (
    value ->> 'siteName' = 'Bác sĩ Wynn Tran'
    or value ->> 'logoText' = 'WT'
    or value ->> 'tagline' = 'Medical Professional'
  );
